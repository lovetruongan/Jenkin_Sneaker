package com.example.Sneakers.services;

import com.example.Sneakers.dtos.ApplyVoucherDTO;
import com.example.Sneakers.dtos.VoucherDTO;
import com.example.Sneakers.exceptions.DataNotFoundException;
import com.example.Sneakers.models.Order;
import com.example.Sneakers.models.User;
import com.example.Sneakers.models.Voucher;
import com.example.Sneakers.models.VoucherUsage;
import com.example.Sneakers.repositories.OrderRepository;
import com.example.Sneakers.repositories.UserRepository;
import com.example.Sneakers.repositories.VoucherRepository;
import com.example.Sneakers.repositories.VoucherUsageRepository;
import com.example.Sneakers.responses.VoucherApplicationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VoucherService implements IVoucherService {
    private final VoucherRepository voucherRepository;
    private final VoucherUsageRepository voucherUsageRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public Voucher createVoucher(VoucherDTO voucherDTO) throws Exception {
        // Check if voucher code already exists
        if (voucherRepository.existsByCode(voucherDTO.getCode())) {
            throw new Exception("Mã voucher bị trùng");
        }

        // Validate dates
        if (voucherDTO.getValidFrom().isAfter(voucherDTO.getValidTo())) {
            throw new Exception("Valid from date must be before valid to date");
        }

        // Create new voucher
        Voucher voucher = Voucher.builder()
                .code(voucherDTO.getCode())
                .name(voucherDTO.getName())
                .description(voucherDTO.getDescription())
                .discountPercentage(voucherDTO.getDiscountPercentage())
                .minOrderValue(voucherDTO.getMinOrderValue() != null ? voucherDTO.getMinOrderValue() : 0L)
                .maxDiscountAmount(voucherDTO.getMaxDiscountAmount())
                .quantity(voucherDTO.getQuantity())
                .remainingQuantity(voucherDTO.getQuantity())
                .validFrom(voucherDTO.getValidFrom())
                .validTo(voucherDTO.getValidTo())
                .isActive(voucherDTO.getIsActive() != null ? voucherDTO.getIsActive() : true)
                .build();

        return voucherRepository.save(voucher);
    }

    @Override
    public Voucher getVoucherById(Long id) throws Exception {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Voucher not found with id: " + id));
    }

    @Override
    public Voucher getVoucherByCode(String code) throws Exception {
        return voucherRepository.findByCode(code)
                .orElseThrow(() -> new DataNotFoundException("Voucher not found with code: " + code));
    }

    @Override
    public Page<Voucher> getAllVouchers(PageRequest pageRequest) {
        return voucherRepository.findAll(pageRequest);
    }

    @Override
    public Page<Voucher> getActiveVouchers(PageRequest pageRequest) {
        return voucherRepository.findAllActive(pageRequest);
    }

    @Override
    public Page<Voucher> getValidVouchers(PageRequest pageRequest) {
        return voucherRepository.findValidVouchers(LocalDateTime.now(), pageRequest);
    }

    @Override
    public Page<Voucher> searchVouchers(String keyword, PageRequest pageRequest) {
        return voucherRepository.searchVouchers(keyword, pageRequest);
    }

    @Override
    @Transactional
    public Voucher updateVoucher(Long id, VoucherDTO voucherDTO) throws Exception {
        Voucher existingVoucher = getVoucherById(id);

        // Check if new code conflicts with another voucher
        if (!existingVoucher.getCode().equals(voucherDTO.getCode()) &&
                voucherRepository.existsByCode(voucherDTO.getCode())) {
            throw new Exception("Mã voucher bị trùng");
        }

        // Validate dates
        if (voucherDTO.getValidFrom().isAfter(voucherDTO.getValidTo())) {
            throw new Exception("Valid from date must be before valid to date");
        }

        // Update voucher fields
        existingVoucher.setCode(voucherDTO.getCode());
        existingVoucher.setName(voucherDTO.getName());
        existingVoucher.setDescription(voucherDTO.getDescription());
        existingVoucher.setDiscountPercentage(voucherDTO.getDiscountPercentage());
        existingVoucher.setMinOrderValue(voucherDTO.getMinOrderValue() != null ? voucherDTO.getMinOrderValue() : 0L);
        existingVoucher.setMaxDiscountAmount(voucherDTO.getMaxDiscountAmount());

        // Update quantity and adjust remaining quantity if needed
        if (voucherDTO.getQuantity() > existingVoucher.getQuantity()) {
            int additionalQuantity = voucherDTO.getQuantity() - existingVoucher.getQuantity();
            existingVoucher.setRemainingQuantity(existingVoucher.getRemainingQuantity() + additionalQuantity);
        }
        existingVoucher.setQuantity(voucherDTO.getQuantity());

        existingVoucher.setValidFrom(voucherDTO.getValidFrom());
        existingVoucher.setValidTo(voucherDTO.getValidTo());
        existingVoucher.setIsActive(voucherDTO.getIsActive() != null ? voucherDTO.getIsActive() : true);

        return voucherRepository.save(existingVoucher);
    }

    @Override
    @Transactional
    public void deleteVoucher(Long id) throws Exception {
        Voucher voucher = getVoucherById(id);

        // Check if voucher is being used in orders
        if (isVoucherUsedInOrders(id)) {
            throw new Exception("Cannot delete voucher as it is being used in orders");
        }

        voucherRepository.delete(voucher);
    }

    @Override
    public VoucherApplicationResponse applyVoucher(ApplyVoucherDTO applyVoucherDTO) throws Exception {
        // Find valid voucher by code
        Voucher voucher = voucherRepository.findValidVoucherByCode(
                applyVoucherDTO.getVoucherCode(),
                LocalDateTime.now()).orElse(null);

        if (voucher == null) {
            return VoucherApplicationResponse.builder()
                    .voucherCode(applyVoucherDTO.getVoucherCode())
                    .originalTotal(applyVoucherDTO.getOrderTotal())
                    .finalTotal(applyVoucherDTO.getOrderTotal())
                    .isApplied(false)
                    .message("Voucher không hợp lệ hoặc đã hết hạn")
                    .build();
        }

        // Check if voucher can be applied to order
        if (!voucher.canApplyToOrder(applyVoucherDTO.getOrderTotal())) {
            return VoucherApplicationResponse.builder()
                    .voucherCode(voucher.getCode())
                    .voucherName(voucher.getName())
                    .originalTotal(applyVoucherDTO.getOrderTotal())
                    .finalTotal(applyVoucherDTO.getOrderTotal())
                    .isApplied(false)
                    .message("Đơn hàng chưa đạt giá trị tối thiểu " + voucher.getMinOrderValue())
                    .build();
        }

        // Calculate discount
        Long discountAmount = voucher.calculateDiscount(applyVoucherDTO.getOrderTotal());
        Long finalTotal = applyVoucherDTO.getOrderTotal() - discountAmount;

        return VoucherApplicationResponse.builder()
                .voucherCode(voucher.getCode())
                .voucherName(voucher.getName())
                .discountPercentage(voucher.getDiscountPercentage())
                .discountAmount(discountAmount)
                .originalTotal(applyVoucherDTO.getOrderTotal())
                .finalTotal(finalTotal)
                .isApplied(true)
                .message("Áp dụng voucher thành công")
                .build();
    }

    @Override
    public boolean isVoucherUsedInOrders(Long voucherId) {
        return voucherRepository.isVoucherUsedInOrders(voucherId);
    }

    @Override
    @Transactional
    public void useVoucher(Long voucherId, Long orderId, Long userId, Long discountAmount) throws Exception {
        Voucher voucher = getVoucherById(voucherId);

        if (voucher.getRemainingQuantity() <= 0) {
            throw new Exception("Voucher đã hết số lượng");
        }

        // Decrease remaining quantity
        voucher.setRemainingQuantity(voucher.getRemainingQuantity() - 1);
        voucherRepository.save(voucher);

        // Create voucher usage record
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("User not found"));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new DataNotFoundException("Order not found"));

        VoucherUsage voucherUsage = VoucherUsage.builder()
                .voucher(voucher)
                .order(order)
                .user(user)
                .discountAmount(discountAmount)
                .build();

        voucherUsageRepository.save(voucherUsage);
    }
}