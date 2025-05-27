package com.example.Sneakers.services;

import com.example.Sneakers.dtos.CartItemDTO;
import com.example.Sneakers.dtos.OrderDTO;
import com.example.Sneakers.exceptions.DataNotFoundException;
import com.example.Sneakers.models.*;
import com.example.Sneakers.repositories.OrderDetailRepository;
import com.example.Sneakers.repositories.OrderRepository;
import com.example.Sneakers.repositories.ProductRepository;
import com.example.Sneakers.repositories.UserRepository;
import com.example.Sneakers.responses.*;
import com.example.Sneakers.utils.BuilderEmailContent;
import com.example.Sneakers.utils.Email;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.cglib.core.Local;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService implements IOrderService{
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final ProductRepository productRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final UserService userService;
    private final CartService cartService;
    @Override
    @Transactional
    public OrderIdResponse createOrder(OrderDTO orderDTO, String token) throws Exception {
        //Tìm xem user id có tồn tại không
        String extractedToken = token.substring(7); // Loại bỏ "Bearer " từ chuỗi token
        User user = userService.getUserDetailsFromToken(extractedToken);
        // Kiểm tra xem cartItems có trống không
        if (orderDTO.getCartItems() == null || orderDTO.getCartItems().isEmpty()) {
            throw new Exception("Cart items are null or empty");
        }
        //Convert orderDTO => Order
        //Dùng thư viện Model Mapper
        //Tạo 1 luồng bằng ánh xạ riêng để kiểm soát việc ánh xạ
//        modelMapper.typeMap(OrderDTO.class,Order.class)
//                .addMappings(mapper -> mapper.skip(Order::setId));
        Long shippingCost = switch (orderDTO.getShippingMethod()) {
            case "Tiêu chuẩn" -> 30000L;
            case "Nhanh" -> 40000L;
            case "Hỏa tốc" -> 60000L;
            default -> throw new Exception("Shipping method is unavailable");
        };
        Order order = Order.builder()
                .user(user)
                .orderDate(LocalDate.now())
                .status(OrderStatus.PENDING)
                .fullName(orderDTO.getFullName())
                .email(orderDTO.getEmail())
                .phoneNumber(orderDTO.getPhoneNumber())
                .address(orderDTO.getAddress())
                .note(orderDTO.getNote())
                .shippingMethod(orderDTO.getShippingMethod())
                .paymentMethod(orderDTO.getPaymentMethod())
                .totalMoney(orderDTO.getTotalMoney()+shippingCost)
                .active(true)
                .shippingDate(LocalDate.now().plusDays(3))
                .build();
//        modelMapper.map(orderDTO,order);
//        order.setUser(user);
//        order.setOrderDate(LocalDate.now());
//        order.setStatus(OrderStatus.PENDING);
        //Kiểm tra shipping date phải >= hôm nay
//        LocalDate shippingDate = orderDTO.getShippingDate() == null ? LocalDate.now() : orderDTO.getShippingDate();
//        if(shippingDate.isBefore(LocalDate.now())){
//            throw new DataNotFoundException("Date must be at least today !");
//        }
//        order.setActive(true);
//        order.setShippingDate(shippingDate);

        orderRepository.save(order);

        // Tạo danh sách các đối tượng OrderDetail từ cartItems
        List<OrderDetail> orderDetails = new ArrayList<>();
        for (CartItemDTO cartItemDTO : orderDTO.getCartItems()) {
            // Tạo một đối tượng OrderDetail từ CartItemDTO
            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(order);

            // Lấy thông tin sản phẩm từ cartItemDTO
            Long productId = cartItemDTO.getProductId();
            Long quantity = cartItemDTO.getQuantity();
            Long size = cartItemDTO.getSize();

            // Tìm thông tin sản phẩm từ cơ sở dữ liệu (hoặc sử dụng cache nếu cần)
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new DataNotFoundException("Product not found with id: " + productId));

            // Đặt thông tin cho OrderDetail
            orderDetail.setProduct(product);
            orderDetail.setNumberOfProducts(quantity);
            orderDetail.setSize(size);

            // Các trường khác của OrderDetail nếu cần
            orderDetail.setPrice(product.getPrice());
            orderDetail.setTotalMoney(product.getPrice()*quantity);
            // Thêm OrderDetail vào danh sách
            orderDetails.add(orderDetail);
        }
        order.setOrderDetails(orderDetails);

        // Lưu danh sách OrderDetail vào cơ sở dữ liệu
        orderDetailRepository.saveAll(orderDetails);
        // Gửi mail thông báo cho người dùng
        Email email = new Email();
        String to = order.getEmail();
        String subject = "Đặt hàng thành công từ Sneaker Store - Đơn hàng #" + order.getId();
        String content = BuilderEmailContent.buildOrderEmailContent(order);
        boolean sendMail = email.sendEmail(to,subject,content);

        if(!sendMail){
            throw new Exception("Cannot send email");
        }
        return OrderIdResponse.fromOrder(order);
    }

    @Override
    public OrderResponse getOrder(Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        return OrderResponse.fromOrder(order);
    }

    @Override
    public OrderResponse getOrderByUser(Long orderId, String token) throws Exception {
        String extractedToken = token.substring(7);
        User user = userService.getUserDetailsFromToken(extractedToken);

        if(user.getRole().getName().equals(Role.ADMIN)){
            return OrderResponse.fromOrder(orderRepository.findById(orderId)
                    .orElseThrow(() -> new Exception("Cannot find order with id = " + orderId)));

        }

        Order order = orderRepository.findById(orderId).orElse(null);
        if(!user.getId().equals(order.getUser().getId())){
            throw new Exception("Cannot get order of another user");
        }
        return OrderResponse.fromOrder(order);
    }

    @Override
    @Transactional
    public Order updateOrder(Long id, OrderDTO orderDTO) throws DataNotFoundException {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Cannot find order with id = " + id));
        User existingUser = userRepository.findById(
                orderDTO.getUserId()).orElseThrow(() ->
                new DataNotFoundException("Cannot find user with id: " + id));
        modelMapper.typeMap(OrderDTO.class,Order.class)
                .addMappings(mapper -> mapper.skip(Order::setId))
                        .addMappings(mapper -> mapper.skip(Order::setOrderDetails));
        modelMapper.map(orderDTO,order);
        order.setUser(existingUser);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if(order != null){
            order.setActive(false);
            orderRepository.save(order);
        }
    }

    @Override
    public List<OrderHistoryResponse> findByUserId(String token) throws Exception {
        String extractedToken = token.substring(7);
        User user = userService.getUserDetailsFromToken(extractedToken);
        List<Order> orders = orderRepository.findByUserId(user.getId());
        return orders.stream().map(OrderHistoryResponse::fromOrder)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderHistoryResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(OrderHistoryResponse::fromOrder)
                .collect(Collectors.toList());
    }

    @Override
    public Page<Order> getOrdersByKeyword(String keyword, Pageable pageable) {
        return orderRepository.findByKeyword(keyword, pageable);
    }

    @Override
    public Order updateOrderStatus(Long orderId, String status) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new Exception("Cannot find order with id = " + orderId));
        order.setStatus(status);
        return orderRepository.save(order);
    }

}