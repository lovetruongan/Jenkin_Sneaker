-- Voucher table
CREATE TABLE IF NOT EXISTS `vouchers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL UNIQUE COMMENT 'Mã voucher duy nhất',
  `name` varchar(100) NOT NULL COMMENT 'Tên voucher',
  `description` text DEFAULT NULL COMMENT 'Mô tả voucher',
  `discount_percentage` int(11) NOT NULL CHECK (`discount_percentage` > 0 AND `discount_percentage` <= 100) COMMENT 'Phần trăm giảm giá',
  `min_order_value` bigint(20) DEFAULT 0 COMMENT 'Giá trị đơn hàng tối thiểu để áp dụng',
  `max_discount_amount` bigint(20) DEFAULT NULL COMMENT 'Số tiền giảm tối đa',
  `quantity` int(11) NOT NULL DEFAULT 1 COMMENT 'Tổng số lượng voucher',
  `remaining_quantity` int(11) NOT NULL DEFAULT 1 COMMENT 'Số lượng voucher còn lại',
  `valid_from` datetime NOT NULL COMMENT 'Thời gian bắt đầu hiệu lực',
  `valid_to` datetime NOT NULL COMMENT 'Thời gian hết hiệu lực',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Trạng thái hoạt động',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_code` (`code`),
  KEY `idx_valid_dates` (`valid_from`, `valid_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Voucher usage table to track which vouchers are used in which orders
CREATE TABLE IF NOT EXISTS `voucher_usage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `discount_amount` bigint(20) NOT NULL COMMENT 'Số tiền được giảm',
  `used_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `voucher_id` (`voucher_id`),
  KEY `order_id` (`order_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `voucher_usage_ibfk_1` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`),
  CONSTRAINT `voucher_usage_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `voucher_usage_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add voucher_id column to orders table
ALTER TABLE `orders` 
ADD COLUMN `voucher_id` int(11) DEFAULT NULL,
ADD COLUMN `discount_amount` bigint(20) DEFAULT 0,
ADD CONSTRAINT `orders_voucher_fk` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`); 