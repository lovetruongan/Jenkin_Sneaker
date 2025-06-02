-- Sample voucher data for testing
USE shopsneaker3;

-- Insert sample vouchers
INSERT INTO `vouchers` (`code`, `name`, `description`, `discount_percentage`, `min_order_value`, `max_discount_amount`, `quantity`, `remaining_quantity`, `valid_from`, `valid_to`, `is_active`) VALUES
('SALE66', 'Sale 6/6', 'Giảm giá nhân dịp 6/6', 20, 500000, 100000, 100, 100, '2024-06-01 00:00:00', '2024-06-30 23:59:59', 1),
('SALE77', 'Sale 7/7', 'Giảm giá nhân dịp 7/7', 15, 300000, 50000, 50, 50, '2024-07-01 00:00:00', '2024-07-31 23:59:59', 1),
('WELCOME10', 'Welcome New User', 'Giảm 10% cho khách hàng mới', 10, 0, 30000, 200, 200, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 1),
('SUMMER25', 'Summer Sale', 'Giảm giá mùa hè', 25, 1000000, 200000, 30, 30, '2024-05-01 00:00:00', '2024-08-31 23:59:59', 1),
('EXPIRED20', 'Expired Voucher', 'Voucher đã hết hạn', 20, 0, NULL, 10, 10, '2023-01-01 00:00:00', '2023-12-31 23:59:59', 1),
('INACTIVE15', 'Inactive Voucher', 'Voucher không hoạt động', 15, 0, NULL, 20, 20, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 0),
('OUTOFSTOCK', 'Out of Stock', 'Voucher đã hết số lượng', 30, 0, NULL, 5, 0, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 1); 