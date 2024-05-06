package com.example.Sneakers.utils;

import com.example.Sneakers.models.Order;
import com.example.Sneakers.models.OrderDetail;
import java.text.DecimalFormat;

public class BuilderEmailContent {
    public static String buildOrderEmailContent(Order order) {
        StringBuilder content = new StringBuilder();
        content.append("<html><body>");
        content.append("<h1>Đặt hàng thành công từ Sneaker Store - Đơn hàng #" + order.getId() + "</h1>");
        content.append("<p>Chào " + order.getFullName() + ",</p>");
        content.append("<p>Chúng tôi xin gửi lời cảm ơn chân thành đến bạn vì đã đặt hàng tại Sneaker Store.</p>");
        content.append("<p>Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị để giao đến bạn.</p>");
        content.append("<p><strong>Địa chỉ nhận hàng của bạn:</strong> " + order.getAddress() + "</p>");
        content.append("<p><strong>Số điện thoại liên hệ:</strong> " + order.getPhoneNumber() + "</p>");
        content.append("<h2>Thông tin đơn hàng:</h2>");

        // Thêm danh sách sản phẩm trong đơn hàng (nếu có)
        if (order.getOrderDetails() != null && !order.getOrderDetails().isEmpty()) {
            content.append("<ul>");
            for (OrderDetail orderDetail : order.getOrderDetails()) {
                content.append("<li>");
                content.append("<p><strong>Tên sản phẩm:</strong> " + orderDetail.getProduct().getName() + "</p>");
                content.append("<p><strong>Kích cỡ:</strong> " + orderDetail.getSize() + "</p>");
                content.append("<p><strong>Số lượng:</strong> " + orderDetail.getNumberOfProducts() + "</p>");
                // Sử dụng DecimalFormat để định dạng số có dấu phân cách ","
                DecimalFormat decimalFormat = new DecimalFormat("#,###");
                String formattedPrice = decimalFormat.format(orderDetail.getProduct().getPrice());
                content.append("<p><strong>Đơn giá:</strong> " + formattedPrice + "</p>");
                content.append("</li>");
            }
            content.append("</ul>");
        }

        // Định dạng tổng tiền cần thanh toán cũng có dấu phân cách ","
        DecimalFormat decimalFormat = new DecimalFormat("#,###");
        String formattedTotalMoney = decimalFormat.format(order.getTotalMoney());
        content.append("<p><strong>Tổng tiền cần thanh toán:</strong> " + formattedTotalMoney + "</p>");

        content.append("<p>Nếu có bất kỳ thắc mắc hoặc vấn đề nào khác, đừng ngần ngại liên hệ với chúng tôi qua địa chỉ email này hoặc số điện thoại hỗ trợ của chúng tôi.</p>");
        content.append("<p>Chúng tôi rất mong bạn sẽ hài lòng với sản phẩm của mình. Cảm ơn bạn đã lựa chọn Sneaker Store!</p>");
        content.append("<p>Trân trọng,</p>");
        content.append("<p>Sneaker Store</p>");
        content.append("</body></html>");

        return content.toString();
    }
}