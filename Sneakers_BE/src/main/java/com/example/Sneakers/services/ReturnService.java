package com.example.Sneakers.services;

import com.example.Sneakers.components.JwtTokenUtils;
import com.example.Sneakers.dtos.AdminReturnActionDTO;
import com.example.Sneakers.dtos.ReturnRequestDTO;
import com.example.Sneakers.exceptions.DataNotFoundException;
import com.example.Sneakers.exceptions.PermissionDenyException;
import com.example.Sneakers.models.Order;
import com.example.Sneakers.models.ReturnRequest;
import com.example.Sneakers.models.User;
import com.example.Sneakers.repositories.OrderRepository;
import com.example.Sneakers.repositories.ReturnRequestRepository;
import com.example.Sneakers.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReturnService implements IReturnService {

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final JwtTokenUtils jwtTokenUtils;
    private final StripeService stripeService;

    @Override
    @Transactional
    public ReturnRequest createReturnRequest(ReturnRequestDTO returnRequestDTO, String token) throws Exception {
        Long userId = getUserIdFromToken(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("User not found"));

        Order order = orderRepository.findById(returnRequestDTO.getOrderId())
                .orElseThrow(() -> new DataNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new PermissionDenyException(
                    "User does not have permission to create a return request for this order");
        }

        if (returnRequestRepository.findByOrderId(order.getId()).isPresent()) {
            throw new Exception("A return request for this order already exists.");
        }

        validateReturnEligibility(order);

        ReturnRequest returnRequest = ReturnRequest.builder()
                .order(order)
                .reason(returnRequestDTO.getReason())
                .refundAmount(BigDecimal.valueOf(order.getTotalMoney()))
                .build();

        return returnRequestRepository.save(returnRequest);
    }

    @Override
    public List<ReturnRequest> getMyReturnRequests(String token) throws Exception {
        Long userId = getUserIdFromToken(token);
        return returnRequestRepository.findByOrderUserId(userId);
    }

    @Override
    public List<ReturnRequest> getAllReturnRequestsForAdmin() {
        return returnRequestRepository.findAllAdmin();
    }

    @Override
    @Transactional
    public ReturnRequest approveReturnRequest(Long requestId, AdminReturnActionDTO actionDTO) throws Exception {
        ReturnRequest returnRequest = findReturnRequestById(requestId);

        if (!returnRequest.getStatus().equals("PENDING")) {
            throw new Exception("Return request can no longer be approved.");
        }

        Order order = returnRequest.getOrder();
        String paymentMethod = order.getPaymentMethod();

        log.info("Approving return request {} for order {} with payment method: {}", requestId, order.getId(), paymentMethod);

        // Handle refund based on payment method
        if ("Thanh toán thẻ thành công".equals(paymentMethod) || "Stripe".equalsIgnoreCase(paymentMethod)) {
            // Auto-refund for Stripe
            log.info("Processing automatic Stripe refund for order: {}", order.getId());
            stripeService.refund(order.getPaymentIntentId());
            returnRequest.setAdminNotes("Refunded via Stripe. " + actionDTO.getAdminNotes());
            returnRequest.setStatus("REFUNDED");
            order.setStatus("canceled");
        } else if ("VNPAY".equalsIgnoreCase(paymentMethod)) {
            // For VNPAY, set to AWAITING_REFUND so admin can trigger VNPAY refund
            log.info("Setting VNPAY order to AWAITING_REFUND status for manual refund processing: {}", order.getId());
            returnRequest.setAdminNotes("Approved for VNPAY refund. " + actionDTO.getAdminNotes());
            returnRequest.setStatus("AWAITING_REFUND");
            order.setStatus("awaiting_refund");
        } else {
            // For COD or other methods, mark for manual refund
            log.info("Setting COD/other payment method to AWAITING_REFUND for manual processing: {}", order.getId());
            returnRequest.setAdminNotes("Manual refund required. " + actionDTO.getAdminNotes());
            returnRequest.setStatus("AWAITING_REFUND");
            order.setStatus("awaiting_refund");
        }
        
        orderRepository.save(order);
        return returnRequestRepository.save(returnRequest);
    }

    @Override
    @Transactional
    public ReturnRequest rejectReturnRequest(Long requestId, AdminReturnActionDTO actionDTO)
            throws DataNotFoundException {
        ReturnRequest returnRequest = findReturnRequestById(requestId);
        returnRequest.setStatus("REJECTED");
        returnRequest.setAdminNotes(actionDTO.getAdminNotes());

        // Optionally, revert order status if needed
        Order order = returnRequest.getOrder();
        order.setStatus("delivered"); // or its original status before return request
        orderRepository.save(order);

        return returnRequestRepository.save(returnRequest);
    }

    private Long getUserIdFromToken(String token) throws Exception {
        String extractedToken = token.substring(7);
        String phoneNumber = jwtTokenUtils.extractPhoneNumber(extractedToken);
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        return user.getId();
    }

    private void validateReturnEligibility(Order order) throws Exception {
        List<String> eligibleStatuses = Arrays.asList("delivered", "success", "shipped");
        if (!eligibleStatuses.contains(order.getStatus().toLowerCase())) {
            throw new Exception("Order status is not eligible for return.");
        }

        LocalDate orderDate = order.getOrderDate();
        long daysSinceOrder = ChronoUnit.DAYS.between(orderDate, LocalDate.now());
        if (daysSinceOrder > 30) {
            throw new Exception("Return period of 30 days has expired.");
        }
    }

    private ReturnRequest findReturnRequestById(Long requestId) throws DataNotFoundException {
        return returnRequestRepository.findById(requestId)
                .orElseThrow(() -> new DataNotFoundException("Return request not found"));
    }

    @Override
    @Transactional
    public ReturnRequest completeRefund(Long requestId, AdminReturnActionDTO actionDTO) throws Exception {
        ReturnRequest returnRequest = findReturnRequestById(requestId);

        if (!"AWAITING_REFUND".equals(returnRequest.getStatus()) && !"APPROVED".equals(returnRequest.getStatus())) {
            throw new Exception("Return request is not in a state that allows refund completion.");
        }

        Order order = returnRequest.getOrder();

        // Mark as completed and update order status to canceled
        returnRequest.setStatus("REFUNDED");
        returnRequest.setAdminNotes("Manual refund completed. " + actionDTO.getAdminNotes());
        order.setStatus("canceled"); // Chuyển trạng thái đơn hàng thành đã hủy

        orderRepository.save(order);
        return returnRequestRepository.save(returnRequest);
    }

    @Override
    @Transactional
    public ReturnRequest processVnpayRefund(Long requestId) throws Exception {
        ReturnRequest returnRequest = findReturnRequestById(requestId);
        
        // Accept both APPROVED and AWAITING_REFUND statuses for VNPAY refund
        if (!"APPROVED".equals(returnRequest.getStatus()) && !"AWAITING_REFUND".equals(returnRequest.getStatus())) {
            throw new Exception("Return request is not in a valid state for VNPAY refund. Current status: " + returnRequest.getStatus());
        }

        log.info("Processing VNPAY refund for return request: {}", requestId);

        Order order = returnRequest.getOrder();
        returnRequest.setStatus("REFUNDED");
        returnRequest.setAdminNotes("Refund successfully processed via VNPAY.");
        order.setStatus("canceled");

        orderRepository.save(order);
        return returnRequestRepository.save(returnRequest);
    }
}