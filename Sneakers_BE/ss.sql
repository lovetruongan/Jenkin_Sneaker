-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.24-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.5.0.6677
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for shopsneaker
CREATE DATABASE IF NOT EXISTS `shopsneaker` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `shopsneaker`;



-- Dumping structure for table shopsneaker.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL DEFAULT '' COMMENT 'Tên danh mục, vd: đồ điện tử',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table shopsneaker.categories: ~4 rows (approximately)
INSERT INTO `categories` (`id`, `name`) VALUES
	(1, 'Nike'),
	(2, 'Adidas'),
	(3, 'New Balance'),
	(4, 'Converse'),
	(5, 'Vans');

-- Dumping structure for table shopsneaker.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table shopsneaker.roles: ~2 rows (approximately)
INSERT INTO `roles` (`id`, `name`) VALUES
	(1, 'USER'),
	(2, 'ADMIN');

-- Dumping structure for table shopsneaker.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(350) DEFAULT NULL COMMENT 'Tên sản phẩm',
  `price` bigint(20) NOT NULL DEFAULT 0,
  `thumbnail` varchar(300) DEFAULT '',
  `description` longtext DEFAULT '',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `discount` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5782 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table shopsneaker.products: ~119 rows (approximately)
INSERT INTO `products` (`id`, `name`, `price`, `thumbnail`, `description`, `created_at`, `updated_at`, `category_id`, `discount`) VALUES
	(1, 'Nike Air Force 1 Full White', 798000, '64baf7b5-635b-4a9e-aec7-03d0fedac82f_nike-air-force-1-low-replica-800x600.jpg', 'Đây là mô tả', '2024-02-16 16:46:58', '2024-02-16 16:46:58', 1, NULL),
	(2, 'Adidas Superstar trắng sọc đen', 3000000, '68c9641a-df79-440d-a7a3-2249e64685db_adidas-superstar-white-replica.jpg', 'Giày adidas Superstar ra đời trên sân bóng rổ nhưng đã trở thành quán quân của phong cách đường phố. Bất kể bạn đang chơi bóng rổ hay chỉ đơn giản là xuống phố, đôi giày này sẽ mang đến cho bạn phong cách đơn giản mà cực cool, một item must-have thường ngày suốt năm thập kỷ qua.', '2024-02-17 07:35:46', '2024-04-02 09:01:16', 2, 20),
	(3, 'Nike Air Force 1 Low Cream Black Swoosh', 24076756, 'ef350705-89f2-4e37-a293-cec3ec4bf069_af1-cream-black-swoosh-800x600.jpg', 'Ab velit laborum.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(4, 'Air Force 1 G-Dragon Peaceminusone Para-noise', 53057840, 'ef20dd75-5f3d-4540-aebd-d3a34211e716_Nike-Air-Force-1-Low-G-Dragon-Peaceminusone-Para-Noise-replica-800x600.jpg', 'Cupiditate voluptatem corrupti et fugit quia.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(5, 'Nike Air Force 1 Gucci', 39024180, '3fdcde54-b611-45ea-b693-e94b6dca086d_af1-gucci-nike-1-800x600.jpg', 'Sed est iusto sed voluptatem rerum maxime.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(6, 'Nike Air Force 1 Low Valentines Day 2024', 32191804, 'dd4e2fcd-9b54-4d89-988a-df9cfda47f55_giay-nike-air-force-1-low-valentines-day-2024-like-auth.jpg', 'Id dolorum nihil dolor neque voluptatem.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(7, 'Air Jordan 1 Mid Chicago White Toe', 73324944, 'cd721569-4060-4f22-b63e-6a4fbf3a2d95_Giay-Nike-Air-Jordan-1-Mid-Chicago-White-Toe-800x600.jpg', 'Tempora laudantium natus.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(8, 'Air Jordan 1 Mid Panda', 48354256, '75b77e09-5ddb-445f-9456-c0d10ac84acb_Air-Jordan-1-Mid-Panda.jpg', 'Rerum placeat dignissimos blanditiis sint quis.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(9, 'Air Jordan 1 Light Smoke Grey', 28441420, '96a4724d-6df3-488c-9ec5-55cb525a921c_Jordan-1-Mid-Light-Smoke-Grey-80.jpg', 'Voluptas esse dolorum iure veritatis a.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(10, 'Air Jordan 1 Mid Tuxedo', 58791932, 'c2b778a5-4ad6-45c6-a8b4-47f779d23dad_Jordan-1-Mid-Tuxedo-White-Black-800x600.jpg', 'Officia quis doloremque.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(11, 'Adidas Samba Classic White', 53477832, '0ce3ac5f-fc54-4b7b-afc4-a67be12d06ef_adidas-adidas-samba-classic-white-800x650.jpg', 'Repellat consequuntur laudantium ut laboriosam vel aliquam cumque.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(12, 'Adidas Stan Smith', 66280032, '85c00f76-5962-480e-80b2-cec0bf541a33_adidas-stan-smith-xanh-navy-replica-800x650.jpg', 'Voluptas distinctio ab.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(13, 'Synergistic Plastic Computer', 37351720, 'a7499a61-81c2-4529-a812-2be0822ff38b_Giay-New-Balance-550-White-Green-800x650.jpg', 'Dolores vitae assumenda.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(14, 'Practical Granite Hat', 3852473, '96266a3a-d330-40d3-98e3-563a295b65b5_converse-chuck-70-plus-black-800x650.jpg', 'Quaerat sunt libero deleniti repudiandae voluptates.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(15, 'Lightweight Iron Coat', 78859080, 'c4d381c4-eb63-4bdf-9526-0120403af008_A-BATHING-APE-BAPE-STA-LOW-BLACK-800x650.jpg', 'Quisquam voluptas amet.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(16, 'Lightweight Copper Keyboard', 23045898, 'cdc20a3c-1ffd-4cad-8e24-f9241ab21fe0_adidas-ultraboost-light-2023.jpg', 'Excepturi qui placeat cupiditate aperiam eum in.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(17, 'Lightweight Paper Watch', 3206612, '254a91ae-3e90-4240-83c4-8f60538d4f26_Giay-New-Balance-CRT-300-Beige-Navy-800x650.jpg', 'Nam quod sed nihil.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(18, 'Heavy Duty Aluminum Bag', 10693008, '96b64f11-3539-4538-9399-69ff17a2a688_vans-vault-checkerbroad-og-replica-800x650.jpg', 'Ut doloremque praesentium sit.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(19, 'Mediocre Concrete Gloves', 5684965, '0d0f026a-342b-42a7-9309-43d79f88a253_vans-vault-2021-og-old-skool-800x650.jpg', 'Veniam non sit enim repudiandae ipsa.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(20, 'Gorgeous Plastic Computer', 69469328, '5446f87d-d7aa-40d3-9cc0-0404b993720c_converse-run-star-hike-high-black-800x650.jpg', 'Deserunt sed iure dolor animi.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(21, 'Sleek Granite Computer', 87038152, '8e4978dc-4a4f-42a3-846a-c27d51caa195_nike-air-max-1-white-black.jpg', 'Qui ab asperiores tempore ut.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(22, 'Gorgeous Iron Gloves', 4301644, '4953d163-90b9-4f38-aaac-d5e6438eb8ec_Adidas-adiFOM-Superstar-White-Black-800x650.jpg', 'Molestias et vel.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(23, 'Rustic Paper Car', 79689840, '8f1f0861-b5e7-4de1-804e-b6777382458b_Giay-New-Balance-2002-‘Grey-Like-Auth.jpg', 'Velit distinctio ea.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(24, 'Practical Wool Table', 20798064, 'f4a3cd3d-898f-4aff-8aa3-41965631bb3e_converse-1970s-navy-high-replica-800x650.jpg', 'Repudiandae accusantium ratione.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(25, 'Enormous Aluminum Coat', 33274068, NULL, 'Consequatur enim doloremque sunt ut qui.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(26, 'Ergonomic Granite Bench', 38703544, NULL, 'Ipsa facere cum.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(27, 'Fantastic Marble Keyboard', 23380620, NULL, 'Neque nisi sequi.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(28, 'Small Bronze Bag', 66643840, NULL, 'Quia facere ut.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(29, 'Durable Wooden Wallet', 21104148, NULL, 'Vel qui vero unde qui exercitationem quo.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(30, 'Awesome Plastic Shoes', 28321924, NULL, 'Rem qui quis quibusdam.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(31, 'Ergonomic Concrete Gloves', 5260309, NULL, 'Dolor neque similique et.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(32, 'Intelligent Marble Hat', 52122144, NULL, 'Ut repellat eius.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(33, 'Intelligent Copper Bag', 77494112, NULL, 'Et laborum dolore asperiores.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(34, 'Small Plastic Bottle', 33854840, NULL, 'Est ut maxime reprehenderit necessitatibus.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(35, 'Fantastic Concrete Bench', 88142232, NULL, 'Placeat omnis quasi commodi.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(36, 'Practical Plastic Wallet', 75324408, NULL, 'Voluptate saepe dolorem aliquam.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(37, 'Incredible Plastic Coat', 67569048, NULL, 'Repudiandae dignissimos et.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(38, 'Ergonomic Cotton Bottle', 20882042, NULL, 'Dicta nobis necessitatibus et aut eaque.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(39, 'Lightweight Paper Keyboard', 60993720, NULL, 'Aut dignissimos necessitatibus provident magni odio accusamus.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(40, 'Sleek Silk Plate', 56475920, NULL, 'Nulla aliquam velit ratione officia harum.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(41, 'Enormous Leather Bag', 27524410, NULL, 'Cumque cumque necessitatibus consequatur sed nisi.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(42, 'Fantastic Granite Table', 38910772, NULL, 'Est aliquid debitis tenetur veniam cumque omnis accusamus.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(43, 'Practical Linen Coat', 66935716, NULL, 'Maiores enim porro ut qui ea necessitatibus.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(44, 'Aerodynamic Aluminum Pants', 9016117, NULL, 'Magnam quo sunt ducimus quo et.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(45, 'Lightweight Granite Hat', 45929112, NULL, 'Odit fugit maiores aut dolorem voluptatem molestiae nisi.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(46, 'Heavy Duty Wool Plate', 74831960, NULL, 'Vel asperiores qui corporis ut.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(47, 'Aerodynamic Silk Lamp', 5330651, NULL, 'Sed dolore corrupti.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(48, 'Heavy Duty Linen Hat', 49988880, NULL, 'Placeat qui sed aperiam animi.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(49, 'Lightweight Rubber Shirt', 20385770, NULL, 'Rerum sunt quia.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(50, 'Rustic Silk Hat', 66315392, NULL, 'Eveniet qui qui officiis aut.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(51, 'Sleek Granite Table', 9968519, NULL, 'In porro velit omnis totam adipisci nihil.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(52, 'Enormous Granite Computer', 44591172, NULL, 'Ducimus possimus alias sunt.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(53, 'Gorgeous Iron Bottle', 27065076, NULL, 'Sit eligendi quas voluptatem error ut aut.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(54, 'Rustic Wooden Wallet', 16650404, NULL, 'Qui quasi laudantium.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(55, 'Gorgeous Steel Bottle', 77264720, NULL, 'Quidem quibusdam voluptates placeat amet est est porro.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(56, 'Rustic Wooden Plate', 62771196, NULL, 'Ut explicabo molestiae officiis sit beatae.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(57, 'Sleek Aluminum Watch', 61454252, NULL, 'Qui quam modi.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(58, 'Incredible Steel Gloves', 11536107, NULL, 'Sed dolorem accusantium sed.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(59, 'Intelligent Wooden Bottle', 58425652, NULL, 'Atque eius quod occaecati odit quia ea dolore.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(60, 'Small Steel Table', 83065000, NULL, 'Nobis a omnis non ratione sed aut iste.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(61, 'Practical Wooden Shoes', 50643632, NULL, 'Et harum autem sed.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(62, 'Durable Leather Plate', 47783032, NULL, 'Quasi et numquam mollitia aperiam odio incidunt.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(63, 'Awesome Plastic Car', 60682548, NULL, 'Et dicta tempora mollitia eaque ipsa.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(64, 'Heavy Duty Cotton Shoes', 60319384, NULL, 'Sed perspiciatis id deserunt consequatur deserunt.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(65, 'Awesome Rubber Pants', 78853464, NULL, 'Et ipsum cupiditate velit omnis exercitationem omnis et.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(66, 'Durable Wool Shirt', 27238244, NULL, 'Dolor recusandae beatae sed ducimus corporis mollitia aliquid.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(67, 'Enormous Iron Clock', 64429900, NULL, 'Sunt voluptate repudiandae qui qui dolore neque.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(68, 'Mediocre Steel Pants', 85343056, NULL, 'Qui itaque veritatis quas minima.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(69, 'Lightweight Silk Hat', 40069976, NULL, 'Cumque officia vel eaque.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(70, 'Aerodynamic Cotton Lamp', 59510440, NULL, 'Voluptatum non nemo nulla.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(71, 'Intelligent Iron Watch', 41494440, NULL, 'Iste asperiores maiores iste illo.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(72, 'Durable Leather Hat', 26727920, NULL, 'Quaerat nam qui ducimus natus.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(73, 'Gorgeous Steel Shirt', 24593364, NULL, 'Iure in aspernatur consequatur.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(74, 'Rustic Copper Watch', 40940792, NULL, 'Qui placeat tenetur quisquam distinctio minima.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(75, 'Intelligent Aluminum Wallet', 52022784, NULL, 'Velit sunt deleniti exercitationem eum unde vitae nesciunt.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(76, 'Synergistic Iron Coat', 37888832, NULL, 'Molestiae beatae eos rerum.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(77, 'Practical Silk Lamp', 30118240, NULL, 'Amet explicabo et quia in error distinctio beatae.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(78, 'Awesome Bronze Table', 86918192, NULL, 'Dolore et ut nam.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(79, 'Intelligent Rubber Shirt', 81148728, NULL, 'Molestiae cum blanditiis veniam quae ipsum esse.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(80, 'Fantastic Plastic Keyboard', 83707680, NULL, 'Odit hic esse.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(81, 'Small Copper Coat', 5389248, NULL, 'Cupiditate voluptatem consectetur a voluptas quo.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(82, 'Ergonomic Steel Computer', 35189380, NULL, 'Exercitationem consequuntur quibusdam.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(83, 'Incredible Aluminum Bottle', 69581488, NULL, 'Et voluptas dignissimos.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(84, 'Aerodynamic Rubber Keyboard', 5559953, NULL, 'Est minus dolor voluptatem iste quidem.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(85, 'Lightweight Wooden Chair', 68947216, NULL, 'Deserunt asperiores officiis.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(86, 'Gorgeous Bronze Watch', 77173048, NULL, 'Dicta eum qui dolor voluptas molestias dolorum non.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(87, 'Lightweight Cotton Knife', 81758480, NULL, 'Ratione nesciunt assumenda temporibus ex veniam odio.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(88, 'Heavy Duty Bronze Chair', 39723232, NULL, 'Labore dolorum impedit rerum deleniti.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(89, 'Small Steel Bench', 1285710, NULL, 'Occaecati aut assumenda aut voluptatibus dolorem doloremque exercitationem.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(90, 'Mediocre Rubber Knife', 41811740, NULL, 'Blanditiis quis quisquam qui ipsam magni exercitationem rerum.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 3, NULL),
	(91, 'Incredible Wool Wallet', 2997334, NULL, 'Odit distinctio rerum doloribus eum tenetur laboriosam molestias.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 2, NULL),
	(92, 'Sleek Paper Hat', 79087280, NULL, 'Blanditiis temporibus placeat quia facere.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(93, 'Ergonomic Granite Coat', 1857657, NULL, 'Modi molestias ipsam consequuntur minima quaerat.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 1, NULL),
	(94, 'Fantastic Granite Clock', 69395472, NULL, 'At dolores repellat.', '2024-02-17 07:35:46', '2024-02-17 07:35:46', 4, NULL),
	(95, 'Incredible Copper Bench', 34700032, NULL, 'Cumque recusandae rem dolorum corrupti.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 4, NULL),
	(96, 'Ergonomic Granite Keyboard', 58491888, NULL, 'Aliquid omnis pariatur non sit assumenda.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 4, NULL),
	(97, 'Intelligent Copper Shoes', 72822424, NULL, 'Tempora aut iste quia modi facilis.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 2, NULL),
	(98, 'Aerodynamic Bronze Plate', 55969484, NULL, 'Quia aliquam consequuntur.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 3, NULL),
	(99, 'Fantastic Granite Plate', 13102122, NULL, 'Ex autem reiciendis nihil omnis dolores dolorem.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 1, NULL),
	(100, 'Ergonomic Cotton Knife', 33194718, NULL, 'Cum non itaque odio iusto ipsam natus.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 3, NULL),
	(101, 'Awesome Linen Hat', 10559578, NULL, 'Quia assumenda animi.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 3, NULL),
	(102, 'Awesome Silk Gloves', 1691930, NULL, 'Distinctio aspernatur nulla quae.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 2, NULL),
	(103, 'Incredible Linen Wallet', 3881953, NULL, 'Veritatis in ratione quia veritatis.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 3, NULL),
	(104, 'Intelligent Silk Computer', 19828304, NULL, 'Quas veritatis minus beatae ut est.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 2, NULL),
	(105, 'Sleek Aluminum Computer', 37022548, NULL, 'Quis consequatur ut molestias quia.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 2, NULL),
	(106, 'Awesome Wooden Bench', 66119288, NULL, 'Ullam rerum qui.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 2, NULL),
	(107, 'Enormous Linen Wallet', 6575077, NULL, 'Voluptatum qui laudantium.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 1, NULL),
	(108, 'Lightweight Linen Car', 55781504, NULL, 'Esse consequatur perspiciatis natus sed et non.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 1, NULL),
	(109, 'Fantastic Bronze Gloves', 14015924, NULL, 'Distinctio enim tempora est.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 4, NULL),
	(110, 'Lightweight Iron Bag', 22425374, NULL, 'Nemo neque magni.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 3, NULL),
	(111, 'Small Plastic Pants', 81604720, NULL, 'Minima sed similique.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 1, NULL),
	(112, 'Incredible Steel Knife', 22070576, NULL, 'Debitis minima quaerat.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 3, NULL),
	(113, 'Heavy Duty Linen Shoes', 41412544, NULL, 'Quaerat occaecati repellendus est qui aut.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 4, NULL),
	(114, 'Practical Iron Bag', 35211472, NULL, 'Dolore ullam nisi doloremque reprehenderit placeat expedita quos.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 1, NULL),
	(115, 'Small Rubber Wallet', 17314388, NULL, 'Dolorem asperiores ipsam.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 2, NULL),
	(116, 'Small Leather Table', 67185376, NULL, 'Rerum possimus sapiente at omnis aut doloribus.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 4, NULL),
	(117, 'Lightweight Plastic Shirt', 3690756, NULL, 'Et sed maxime eaque libero est distinctio.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 3, NULL),
	(118, 'Ergonomic Rubber Shoes', 77476704, NULL, 'Aut dolorem temporibus expedita.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 4, NULL),
	(119, 'Small Leather Bottle', 26855136, NULL, 'Architecto quia et sed distinctio suscipit eos.', '2024-02-17 07:35:47', '2024-02-17 07:35:47', 2, NULL);

-- Dumping structure for table shopsneaker.product_images
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) DEFAULT NULL,
  `image_url` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table shopsneaker.product_images: ~107 rows (approximately)
INSERT INTO `product_images` (`id`, `product_id`, `image_url`) VALUES
	(2, 1, '64baf7b5-635b-4a9e-aec7-03d0fedac82f_nike-air-force-1-low-replica-800x600.jpg'),
	(3, 1, '6e7c3444-2475-4880-847d-e6754557316e_af1-full-white-like-auth-6-650x650.jpg'),
	(4, 1, '9a59a80f-44b5-457b-8092-7bc20833520d_Nike-AF1-like-auth-650x650.jpg'),
	(5, 1, 'b59ee515-1c87-4e56-a858-00eb37327f86_af1-full-white-like-auth-11-650x650.jpg'),
	(6, 1, 'cd1c656d-c0e4-45aa-be3e-d6be65593b6a_af1-full-white-like-auth-13-650x650.jpg'),
	(7, 2, '68c9641a-df79-440d-a7a3-2249e64685db_adidas-superstar-white-replica.jpg'),
	(8, 2, '5f4d5357-cd0d-44a3-b13b-e3a14fccd2ba_giay-adidas-superstar-trang-soc-djen-best-quality-1-650x650.jpg'),
	(9, 2, '5477277c-4d91-4609-b801-f94a49b4fa8e_giay-adidas-superstar-trang-soc-djen-best-quality-2-650x650.jpg'),
	(10, 2, 'b0e1bca8-86b5-4357-83b4-9f7266fcfba7_giay-adidas-superstar-trang-soc-djen-best-quality-3-650x650.jpg'),
	(11, 2, '1a3d4f41-8d90-4462-a329-08d75157d5f8_giay-adidas-superstar-trang-soc-djen-best-quality-5-650x650.jpg'),
	(12, 3, 'ef350705-89f2-4e37-a293-cec3ec4bf069_af1-cream-black-swoosh-800x600.jpg'),
	(13, 3, '80255d83-91f8-4207-9f18-4d466447be63_air-force-1-low-cream-black-swoosh-6-800x600.jpg'),
	(14, 3, '237a0e0d-26c8-4efe-93c2-4814c58e8ab0_air-force-1-low-cream-black-swoosh-7-800x600.jpg'),
	(15, 3, 'f7bf9bfb-6355-4729-9e36-213bcc171297_air-force-1-low-cream-black-swoosh-8-800x600.jpg'),
	(16, 3, 'a00bbd3b-372b-4658-9c62-06f15f304101_air-force-1-low-cream-black-swoosh-9-800x600.jpg'),
	(17, 4, 'ef20dd75-5f3d-4540-aebd-d3a34211e716_Nike-Air-Force-1-Low-G-Dragon-Peaceminusone-Para-Noise-replica-800x600.jpg'),
	(18, 4, 'c0fdd184-f0ef-4f99-a80f-0aea9ea4f095_giay-nike-air-force-1-dragon-paranoise-replica-3-800x600.jpg'),
	(19, 4, 'bd283865-9f4e-42cd-b984-bb3ed0081162_giay-nike-air-force-1-dragon-paranoise-replica-4-800x600.jpg'),
	(20, 4, '1f01daad-f0c9-4ee8-89da-29efe6c120a2_giay-nike-air-force-1-dragon-paranoise-replica-7-800x600.jpg'),
	(21, 4, '260aad88-82c5-4f70-9b1d-cd3fa3b6466e_giay-nike-air-force-1-dragon-paranoise-replica-2-800x599.jpg'),
	(22, 5, '3fdcde54-b611-45ea-b693-e94b6dca086d_af1-gucci-nike-1-800x600.jpg'),
	(23, 5, '88260575-0f02-4fbb-b042-4f2f89b40ca7_Air-Force-1-Gucci-650x650.jpg'),
	(24, 5, '7e641f86-6f13-4fd4-b97c-966c48c82861_Air-Force-1-Low-By-You-Custom–Gucci-650x650.jpg'),
	(25, 5, '40deee30-a722-42f6-b844-3ce398bf13e1_Nike-Air-Force-1-Gucci-650x650.jpg'),
	(26, 5, 'acba9374-bca0-4c34-9672-92e3267c3f78_Nike-Air-Force-1-Low-By-You-Custom-Gucci-650x650.jpg'),
	(27, 6, 'dd4e2fcd-9b54-4d89-988a-df9cfda47f55_giay-nike-air-force-1-low-valentines-day-2024-like-auth.jpg'),
	(28, 6, '907f9d48-362f-4a4f-80c2-91832c5e0b89_giay-nike-air-force-1-low-valentines-day-2024-like-auth-1-650x650.jpg'),
	(29, 6, '0672d45d-a0ee-4d83-941f-64382f7bdcf6_giay-nike-air-force-1-low-valentines-day-2024-like-auth-2-650x650.jpg'),
	(30, 6, '2236231e-19a4-4434-8600-4b918fd23e27_giay-nike-air-force-1-low-valentines-day-2024-like-auth-7-650x650.jpg'),
	(31, 6, 'e148e7da-8c87-496f-890c-d8b4c760ba68_giay-nike-air-force-1-low-valentines-day-2024-like-auth-8-650x650.jpg'),
	(32, 7, 'cd721569-4060-4f22-b63e-6a4fbf3a2d95_Giay-Nike-Air-Jordan-1-Mid-Chicago-White-Toe-800x600.jpg'),
	(33, 7, 'e07b51e7-176d-433d-bf0b-6fa2d1b14781_mid-chicago-white-toe-2-800x600.jpg'),
	(34, 7, '0db85c7a-72c9-4b9b-a20c-d39462d4e1a5_mid-chicago-white-toe-6-800x600.jpg'),
	(35, 7, 'b832e93e-45ae-412e-ab2b-e2ee70c09159_mid-chicago-white-toe-7-800x600.jpg'),
	(36, 7, '0ac185a4-aad3-4ef1-91a6-b6bed5c6c244_mid-chicago-white-toe-rep11-800x600.jpg'),
	(37, 8, '75b77e09-5ddb-445f-9456-c0d10ac84acb_Air-Jordan-1-Mid-Panda.jpg'),
	(38, 8, '189b8181-89b1-4f70-a20e-2f58b8af7a99_giay-nike-air-jordan-1-mid-panda-like-auth-4-650x650.jpg'),
	(39, 8, '5774e376-59cd-41ab-80b3-746dd64c6c45_giay-nike-air-jordan-1-mid-panda-like-auth-5-650x650.jpg'),
	(40, 8, '68ef9789-384b-4c23-8917-b205a85ed0de_giay-nike-air-jordan-1-mid-panda-like-auth-6-650x650.jpg'),
	(41, 8, 'f7926cf6-fd53-4a0e-8a09-571fe45868a9_giay-nike-air-jordan-1-mid-panda-like-auth-7-650x650.jpg'),
	(42, 9, '96a4724d-6df3-488c-9ec5-55cb525a921c_Jordan-1-Mid-Light-Smoke-Grey-80.jpg'),
	(43, 9, 'a2fd96b8-0555-4392-aec0-0855a626e105_giay-nike-air-jordan-1-mid-light-smoke-grey-best-quality-3-650x650.jpg'),
	(44, 9, 'e5def09d-c338-41e2-a176-60deda8638b3_giay-nike-air-jordan-1-mid-light-smoke-grey-best-quality-5-650x650.jpg'),
	(45, 9, '57966fb4-f843-4ef1-b7cb-b87363a628b0_giay-nike-air-jordan-1-mid-light-smoke-grey-best-quality-6-650x650.jpg'),
	(46, 9, '560432b9-51b4-489c-90ad-853672374304_giay-nike-air-jordan-1-mid-light-smoke-grey-best-quality-1-650x650.jpg'),
	(47, 10, 'c2b778a5-4ad6-45c6-a8b4-47f779d23dad_Jordan-1-Mid-Tuxedo-White-Black-800x600.jpg'),
	(48, 10, '0d382d74-a604-495b-8c43-fb9117886661_Air-Jordan-1-Mid-Tuxedo-White-Black-650x650.jpg'),
	(49, 10, 'fbf8ba07-4bc3-4806-828c-a13ba8fca86d_Nike-Air-Jordan-1-Mid-Tuxedo-White-Black-11-650x650.jpg'),
	(50, 10, '2dfb1117-216d-4377-8d90-ccbf8954c428_Nike-Air-Jordan-1-Mid-Tuxedo-White-Black-650x650.jpg'),
	(51, 10, '6eb1969d-c2df-41dc-810a-b3da32afa2f0_Nike-Air-Jordan-1-Mid-Tuxedo-White-Black-rep-650x650.jpg'),
	(52, 11, '0ce3ac5f-fc54-4b7b-afc4-a67be12d06ef_adidas-adidas-samba-classic-white-800x650.jpg'),
	(53, 11, '3fd6dd5f-17e0-43ce-948d-880977072e8e_adidas-samba-classic-white-3-800x650.jpg'),
	(54, 11, '110722cd-3ce5-4ed4-b1ad-af9e189372a7_adidas-samba-classic-white-6-800x650.jpg'),
	(55, 11, '04117523-9f4a-4e1c-a455-35f0213dabf0_adidas-samba-classic-white-9-800x650.jpg'),
	(56, 11, '0e1413f8-1d56-4e68-a337-e32c685b8874_adidas-samba-classic-white-10-800x650.jpg'),
	(57, 12, '85c00f76-5962-480e-80b2-cec0bf541a33_adidas-stan-smith-xanh-navy-replica-800x650.jpg'),
	(58, 12, '0f8e8aca-e673-4d8e-8f85-558f3c04c5f5_adidas-stan-smith-got-xanh-navy-replica-3-800x650.jpg'),
	(59, 12, '19cdb9c3-c478-48d8-b921-6abc80778341_adidas-stan-smith-got-xanh-navy-replica-4-800x650.jpg'),
	(60, 12, '742eb45b-6e52-4a32-8076-57ab92567f81_adidas-stan-smith-got-xanh-navy-replica-7-800x650.jpg'),
	(61, 12, 'd01597a6-f2bd-439e-b834-bf142b22bbc2_adidas-stan-smith-got-xanh-navy-replica-2-800x650.jpg'),
	(62, 13, 'a7499a61-81c2-4529-a812-2be0822ff38b_Giay-New-Balance-550-White-Green-800x650.jpg'),
	(63, 13, '2802882d-c61b-4f90-916c-22ae39c5003a_new-balance-550-white-green-2-800x650.jpg'),
	(64, 13, '6af637ab-075c-4aa1-900e-f6c1ac6506b6_new-balance-550-white-green-3-800x650.jpg'),
	(65, 13, '78033707-92f5-4aa1-a0d2-e6469c411d66_new-balance-550-white-green-10-800x650.jpg'),
	(66, 13, '1c6d9a52-f49e-40be-a703-8dd7e07fb729_new-balance-550-white-green-12-800x650.jpg'),
	(67, 14, '96266a3a-d330-40d3-98e3-563a295b65b5_converse-chuck-70-plus-black-800x650.jpg'),
	(68, 14, 'f2d18780-36a8-4e4f-b730-5585783ce1c8_converse-chuck-70-plus-black-3-800x650.jpg'),
	(69, 14, '8c219a39-70e3-4986-a4c3-10bdb8794c9e_converse-chuck-70-plus-black-9-800x650.jpg'),
	(70, 14, '49d2fc24-c595-47c2-b671-627dd44c8a92_converse-chuck-70-plus-black-10-800x650.jpg'),
	(71, 14, 'ae1aeed5-a9dc-46b6-94ad-d972ba96d1e7_converse-chuck-70-plus-black-1-800x650.jpg'),
	(72, 15, 'c4d381c4-eb63-4bdf-9526-0120403af008_A-BATHING-APE-BAPE-STA-LOW-BLACK-800x650.jpg'),
	(73, 15, '91d16360-0484-4ea7-8f94-edf094c8720d_giay-a-bathing-ape-bape-sta-low-black-best-quality-5-800x650.jpg'),
	(74, 15, '47214cdc-3496-4b6c-883b-6ceb74f2b6aa_giay-a-bathing-ape-bape-sta-low-black-best-quality-6-800x650.jpg'),
	(75, 15, '907db361-d184-4cce-b5a6-b67baaf8749a_giay-a-bathing-ape-bape-sta-low-black-best-quality-16-800x650.jpg'),
	(76, 15, '52525f44-c3db-4673-bc5b-11a281d3fc62_giay-a-bathing-ape-bape-sta-low-black-best-quality-17-800x650.jpg'),
	(77, 16, 'cdc20a3c-1ffd-4cad-8e24-f9241ab21fe0_adidas-ultraboost-light-2023.jpg'),
	(78, 16, 'e6e73f42-3ba9-4cde-b0c8-561e4105ceed_giay-adidas-wmns-ultraboost-23-light-white-solar-red-like-auth-3-800x650.jpg'),
	(79, 16, 'eb0434ef-1b63-42e0-bcbd-ca2fc5b6eced_giay-adidas-wmns-ultraboost-23-light-white-solar-red-like-auth-5-800x650.jpg'),
	(80, 16, '3f96932b-8e45-4246-9bda-757ff4287e0d_giay-adidas-wmns-ultraboost-23-light-white-solar-red-like-auth-9-800x650.jpg'),
	(81, 16, '86b874dc-d323-4439-9ef9-d05e6da4119e_giay-adidas-wmns-ultraboost-23-light-white-solar-red-like-auth-10-800x650.jpg'),
	(82, 17, '254a91ae-3e90-4240-83c4-8f60538d4f26_Giay-New-Balance-CRT-300-Beige-Navy-800x650.jpg'),
	(83, 17, 'ccdc2000-3f4b-4ed2-96c1-10d508ad0d5a_giay-new-balance-crt-300-beige-navy-7-800x650.jpg'),
	(84, 17, '1cafbebd-0d9d-44af-84d5-e2c40b146f89_giay-new-balance-crt-300-beige-navy-8-800x650.jpg'),
	(85, 17, '74431bf2-f679-4807-8e34-bb9076789644_giay-new-balance-crt-300-beige-navy-9-800x650.jpg'),
	(86, 17, '71c848f7-0597-40ff-861c-d9e709924984_giay-new-balance-crt-300-beige-navy-1-800x650.jpg'),
	(87, 18, '96b64f11-3539-4538-9399-69ff17a2a688_vans-vault-checkerbroad-og-replica-800x650.jpg'),
	(88, 18, 'a5a44d79-2e62-4b10-ad14-d9d172b15599_Vans-Vault-OG-Classic-Slip-On-LX-Checkerboard-replica-2-800x650.jpg'),
	(89, 18, '42129f68-eea5-427d-88af-7862befd3e94_Vans-Vault-OG-Classic-Slip-On-LX-Checkerboard-replica-3-800x650.jpg'),
	(90, 18, '7d6e79e3-5467-4978-9e87-02b935912e11_Vans-Vault-OG-Classic-Slip-On-LX-Checkerboard-replica-5-800x650.jpg'),
	(91, 18, 'bc3e7960-fe4c-4b85-ab05-ff95cb41b39f_Vans-Vault-OG-Classic-Slip-On-LX-Checkerboard-replica-6-800x650.jpg'),
	(92, 19, '0d0f026a-342b-42a7-9309-43d79f88a253_vans-vault-2021-og-old-skool-800x650.jpg'),
	(93, 19, '4cebfa6a-12cd-4699-b992-35f7b003c878_vans-vault-2021-6-800x650.jpg'),
	(94, 19, '5d3ae5a3-7942-4b4b-a694-340f014c8183_vans-vault-2021-7-800x650.jpg'),
	(95, 19, '7fe20439-97a2-4af7-8ff6-62ebf8bab270_vans-vault-2021-10-800x650.jpg'),
	(96, 19, '1df708d1-be27-4a74-bf99-50420c5ec818_vans-vault-2021-3-800x650.jpg'),
	(97, 20, '5446f87d-d7aa-40d3-9cc0-0404b993720c_converse-run-star-hike-high-black-800x650.jpg'),
	(98, 20, 'b01a7219-a228-443d-992e-c255133db0b4_converse-run-star-hike-high-black-2-800x650.jpg'),
	(99, 20, '44bb6282-8602-4ff6-8582-46bbc99361cf_converse-run-star-hike-high-black-5-800x650.jpg'),
	(100, 20, 'e736bc5c-045c-434d-a20b-86228d7de192_converse-run-star-hike-high-black-7-800x650.jpg'),
	(101, 20, '1d13885d-5fa4-40e2-831c-885ff46f6c9e_converse-run-star-hike-high-black-1-800x650.jpg'),
	(102, 21, '8e4978dc-4a4f-42a3-846a-c27d51caa195_nike-air-max-1-white-black.jpg'),
	(103, 21, '5ebabd97-ae1b-416e-b425-e1dc051a5cd0_Giay-Nike-Air-Max-1-‘White-Black-Like-Auth-8-800x650.jpg'),
	(104, 21, 'ba9abbd5-84d9-4d48-9332-a09e5aacf29d_Giay-Nike-Air-Max-1-‘White-Black-Like-Auth-9-800x650.jpg'),
	(105, 21, 'f52f1f40-20fd-4e54-9f25-00784598ca68_Giay-Nike-Air-Max-1-‘White-Black-Like-Auth-11-800x650.jpg'),
	(106, 21, 'e472f863-0a13-4f91-8e4d-7be54681fae6_Giay-Nike-Air-Max-1-‘White-Black-Like-Auth-5-800x650.jpg'),
	(107, 22, '4953d163-90b9-4f38-aaac-d5e6438eb8ec_Adidas-adiFOM-Superstar-White-Black-800x650.jpg'),
	(108, 22, '6db02ec9-ca67-42b5-984f-65464072c895_giay-adidas-adifom-superstar-white-black-1-800x650.jpg'),
	(109, 22, 'bdc6c2db-db5c-4901-83a0-72ee5f4cc05a_giay-adidas-adifom-superstar-white-black-3-800x650.jpg'),
	(110, 22, '6417f2b9-4cf3-4e64-a6dd-b853c1101e7a_giay-adidas-adifom-superstar-white-black-5-800x650.jpg'),
	(111, 22, '0b021a98-99b1-458f-add3-6464701ce854_giay-adidas-adifom-superstar-white-black-10-800x650.jpg'),
	(112, 23, '8f1f0861-b5e7-4de1-804e-b6777382458b_Giay-New-Balance-2002-‘Grey-Like-Auth.jpg'),
	(113, 23, 'e68303b3-52cf-491f-a99a-6762bd094096_giay-new-balance-2002-grey-like-auth-1-800x650.jpg'),
	(114, 23, '979323bb-812e-4d09-82ff-7018d745fcd2_giay-new-balance-2002-grey-like-auth-10-800x650.jpg'),
	(115, 23, '68fbbaa6-d75a-400d-965a-8d7b492e0a69_giay-new-balance-2002-grey-like-auth-11-800x650.jpg'),
	(116, 23, '57d57b99-6948-401c-a50c-ab355ead89ca_giay-new-balance-2002-grey-like-auth-12-800x650.jpg'),
	(117, 24, 'f4a3cd3d-898f-4aff-8aa3-41965631bb3e_converse-1970s-navy-high-replica-800x650.jpg'),
	(118, 24, '58c1b56c-7df4-4536-adc5-9b0973ec2c85_converse-1970s-xanh-navy-co-cao-replica-4-800x650.jpg'),
	(119, 24, '40d50a7a-0763-41f8-8ebe-b528829c9e63_converse-1970s-xanh-navy-co-cao-replica-5-800x650.jpg'),
	(120, 24, '56936385-c732-47e7-9230-714d184d0eda_converse-1970s-xanh-navy-co-cao-replica-6-800x650.jpg'),
	(121, 24, 'ea828b0e-f447-4fbe-976b-6188ec2ac186_converse-1970s-xanh-navy-co-cao-replica-7-800x650.jpg');

-- Dumping structure for table shopsneaker.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fullname` varchar(100) DEFAULT '',
  `phone_number` varchar(10) NOT NULL,
  `address` varchar(200) DEFAULT '',
  `password` varchar(100) NOT NULL DEFAULT '',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `date_of_birth` date DEFAULT NULL,
  `facebook_account_id` int(11) DEFAULT 0,
  `google_account_id` int(11) DEFAULT 0,
  `role_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table shopsneaker.users: ~17 rows (approximately)
INSERT INTO `users` (`id`, `fullname`, `phone_number`, `address`, `password`, `created_at`, `updated_at`, `is_active`, `date_of_birth`, `facebook_account_id`, `google_account_id`, `role_id`) VALUES
	(1, 'Trần Đức Anh', '0865247233', 'Hanoi', '21112003', NULL, NULL, 1, '2003-11-21', 0, 0, NULL),
	(2, 'Lưu Thuỳ Linh  ', '0123456789', 'Hanoi', '$2a$10$rOkHZxxyhIbFNofDaorwruUjO2vCHLpnfz7j0RmoVaDz6lKHl5P6O', '2024-02-20 09:12:32', '2024-02-20 09:12:32', 1, '2003-07-06', 0, 0, 1),
	(3, 'ADMIN 1', '0111222333', 'Hanoi', '$2a$10$zgJgPl51rJQGl8xlznCKgOGipZjbaPMXiF/Zv/03ri1mA1iN1Z.su', '2024-02-21 09:00:03', '2024-02-21 09:00:03', 1, '2003-11-12', 0, 0, 2),
	(4, 'Nguyễn Văn A', '0197252343', 'Thái Nguyên', '$2a$10$EaQ4vkmvqt.cTdgfq7WLN.wyhDnD3iEm4CNKWK75pQLImwFod1Flm', '2024-02-23 10:45:57', '2024-02-23 10:45:57', 1, '2006-02-23', 0, 0, 1),
	(5, 'Đỗ Tùng Lâm', '0456123789', 'Thái Nguyên', '$2a$10$Q2vfr2lGKvN2u8VzfaZeJurW0AiKdhm3xTzKeNu7XoYEqzqQUk8l2', '2024-02-23 15:02:28', '2024-02-23 15:02:28', 1, '2006-02-23', 0, 0, 1),
	(6, 'Hà Quang Dương', '0967854321', 'Thái Nguyên', '$2a$10$yah7HFxQ652PAOaxXOXHfulu4ML1PidYvYAa8.m..pLIO/SiK4nti', '2024-02-23 15:59:41', '2024-02-23 15:59:41', 1, '2005-02-23', 0, 0, 1),
	(7, 'Hà Quang Dương', '0967854321', 'Thái Nguyên', '$2a$10$cHyGqlu9q5VHC0zNTsDXmu/jFiT.ZmK3Rz1jwKL785mja7/irc2fS', '2024-02-23 16:35:24', '2024-02-23 16:35:24', 1, '2005-02-23', 0, 0, 1),
	(8, 'Long ăn cứt', '0678123459', 'Hà Nội', '$2a$10$aWgT6VW6M/hU4Lnreu6f7.v8UyvuRWU0Z7t/DU2Is541rGzFwSIpG', '2024-02-24 07:46:00', '2024-02-24 07:46:00', 1, '2005-02-24', 0, 0, 1),
	(9, 'Long ăn cứt', '0678123459', 'Hà Nội', '$2a$10$xCyTUzu/7myRDS/Aa67s/uA6nYF3UdfMD/vrwASyPMzvBscBOcRP6', '2024-02-24 07:46:00', '2024-02-24 07:46:00', 1, '2005-02-24', 0, 0, 1),
	(10, 'Long ăn cứt', '0678123459', 'Hà Nội', '$2a$10$GI9/NYptwgzaSzkZH5LaaueSZLbga0WbbST8smzca/ufe.n0yqv7C', '2024-02-24 07:46:00', '2024-02-24 07:46:00', 1, '2005-02-24', 0, 0, 1),
	(11, 'Long ăn cứt', '0678123459', 'Hà Nội', '$2a$10$DJesTEN3ThvfZjl4tvmBbeIE8vAHIj0Hus5/L8A163CiNeXkDHR0m', '2024-02-24 07:46:00', '2024-02-24 07:46:00', 1, '2005-02-24', 0, 0, 1),
	(12, 'Nguyễn Phương Mai', '0865211203', 'Hà Nội', '$2a$10$ihJRuUH5BsZ0PJ1LPqUMCuXFI0u4QFMkN5byGadeKOguCyjgdzNOW', '2024-02-25 15:36:49', '2024-02-25 15:36:49', 1, '2005-02-25', 0, 0, 1),
	(13, 'Nguyễn Vũ Bảo Long', '0113355779', 'Hà Nội', '$2a$10$0p4m7/W1QVDZG2ui5aPytujxppt4xK2C8S.OMJKlurjovveRvnzqm', '2024-03-19 10:09:29', '2024-03-23 08:41:48', 1, '2003-09-13', 0, 0, 1),
	(14, 'Trần Đức Anh', '0865247234', 'Hà Nội', '$2a$10$yjh/pZGtFpeyfaPSCb0IceZfG8sIS3H.7OmmV.dQq7GQ3WefLFADO', '2024-03-21 06:43:07', '2024-03-21 06:43:07', 1, '2003-11-21', 0, 0, 1),
	(15, 'Hà Quang Dương', '0911725756', 'Thái Nguyên', '$2a$10$PPWS5r60c0pvkeWlVSeGlucfqBnJwtHQ7/FBgeRKx05ixVmg6fhlC', '2024-03-28 15:55:14', '2024-03-28 15:55:14', 1, '2003-03-20', 0, 0, 1),
	(16, 'Hoàng Ngọc Hà', '0911123456', 'Hà Nội', '$2a$10$wzTu2DbgN6MLTrcDdDkQE.jqiIl4ySdr/RZzEEKDlyxkqI6DihlLi', '2024-03-28 15:56:02', '2024-03-28 15:56:02', 1, '2003-10-15', 0, 0, 1),
	(17, 'Trần Đức Anh', '0123786457', 'Hà Nội', '$2a$10$J4/bvTOHxOT2DiAg.ga81.vvoFdrSKbNuQ20lFaoOQI4zLHAfl7IO', '2024-03-28 16:09:07', '2024-03-28 16:09:07', 1, '2003-11-21', 0, 0, 1);


-- Dumping structure for table shopsneaker.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `fullname` varchar(100) DEFAULT '',
  `email` varchar(100) DEFAULT '',
  `phone_number` varchar(20) NOT NULL,
  `address` varchar(200) NOT NULL,
  `note` varchar(100) DEFAULT '',
  `order_date` datetime DEFAULT current_timestamp(),
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT NULL COMMENT 'Trạng thái đơn hàng',
  `total_money` bigint(20) DEFAULT NULL,
  `shipping_method` varchar(100) DEFAULT NULL,
  `shipping_date` date DEFAULT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table shopsneaker.orders: ~23 rows (approximately)
INSERT INTO `orders` (`id`, `user_id`, `fullname`, `email`, `phone_number`, `address`, `note`, `order_date`, `status`, `total_money`, `shipping_method`, `shipping_date`, `payment_method`, `active`) VALUES
	(1, 1, 'Trần Đức Em', 'ducanh21112003@gmail.com', '0865247233', 'Hanoi', '', NULL, NULL, 1000000, 'express', NULL, 'cod', 1),
	(2, 1, 'Lưu Thuỳ Linh', 'chill@gmail.com', '0123456789', 'Hanoi', 'Hàng dễ vỡ xin nhẹ tay', '2024-02-19 00:00:00', 'shipped', 1000001, 'express', '2024-02-19', 'cod', 1),
	(3, 1, 'Hà Quang Dương', 'duong2032003@gmail.com', '0123456789', 'Hanoi', '', '2024-02-18 08:48:57', 'pending', 1000000, 'express', '2024-02-18', 'cod', 1),
	(4, 1, 'Hà Quang Dương', 'duong2032003@gmail.com', '0123456789', 'Hanoi', '', '2024-02-18 08:58:25', 'pending', 1000000, 'express', '2024-02-18', 'cod', 0),
	(5, 13, 'Nguyễn Vũ Bảo Long', 'nvxx@yahoo.com', '0113355779', 'Nhà a ngõ B, ngách D', 'Hàng dễ vỡ xin nhẹ tay', NULL, 'shipped', 123, 'express', NULL, 'cod', 1),
	(6, 13, 'Nguyễn Vũ Bảo Long', 'nvxx@yahoo.com', '0113355779', 'Nhà a ngõ B, ngách D', 'Hàng dễ vỡ xin nhẹ tay', '2024-03-19 10:19:58', 'pending', 123, 'express', '2024-03-19', 'cod', 1),
	(7, 13, 'Bảo Long', 'baolong@gmail.com', '0113355779', 'nhà x ngõ y', 'dễ vỡ', '2024-03-20 00:00:00', 'pending', 149633200, 'express', '2024-03-20', 'cod', 1),
	(8, 13, 'Nguyễn Vũ Bảo Long', 'nvxx@yahoo.com', '0113355779', 'Nhà a ngõ B, ngách D', 'Hàng dễ vỡ xin nhẹ tay', '2024-03-21 00:00:00', 'pending', 123, 'express', '2024-03-21', 'cod', 1),
	(9, 14, 'Bảo Long', 'baolong@gmail.com', '0113355779', 'nhà x ngõ y', 'dễ vỡ', '2024-03-27 00:00:00', 'pending', 1081170816, 'express', '2024-03-27', 'cod', 1),
	(10, 14, 'Đức Anh', 'ducanh@gmail.com', '0865247233', 'nhà x ngõ y', 'dễ vỡ', '2024-03-27 00:00:00', 'pending', 209694496, 'express', '2024-03-27', 'cod', 1),
	(11, 14, 'Bảo Long', 'baolong@gmail.com', '0113355779', 'nhà x ngõ y', 'dễ vỡ', '2024-03-27 00:00:00', 'pending', 0, 'express', '2024-03-27', 'cod', 1),
	(12, 14, 'Trần Đức Anh', 'ducanh@yahoo.com', '0865247234', 'Sn 22, ngách 108, ngõ 68', 'Hàng dễ vỡ xin nhẹ tay', '2024-03-29 00:00:00', 'pending', 3000000, 'express', '2024-03-29', 'cod', 1),
	(13, 14, 'Trần Đức Anh', 'ducanh@gmail.com', '0865247234', 'Sn 22, ngách 108, ngõ 68', 'Hàng dễ vỡ xin nhẹ tay', '2024-04-02 00:00:00', 'pending', 3000000, 'express', '2024-04-02', 'cod', 1),
	(14, 14, 'Trần Đức Anh', 'ducanh@gmail.com', '0865247234', 'Sn 22, ngách 108, ngõ 68', 'Hàng dễ vỡ xin nhẹ tay', '2024-04-05 00:00:00', 'pending', 3000000, 'express', '2024-04-08', 'cod', 1),
	(15, 15, 'Hà Quang Dương', 'quangduong@gmail.com', '0911725756', 'Sn 22, ngách 108, ngõ 68', 'Hàng dễ vỡ xin nhẹ tay', '2024-04-05 00:00:00', 'pending', 5000000, 'express', '2024-04-08', 'cod', 1),
	(16, 15, 'Hà Quang Dương', 'quangduong@gmail.com', '0911725756', 'Sn 22, ngách 108, ngõ 68', 'Hàng dễ vỡ xin nhẹ tay', '2024-04-05 00:00:00', 'pending', 0, 'express', '2024-04-08', 'cod', 1),
	(17, 15, 'Hà Quang Dương', 'quangduong@gmail.com', '0911725756', 'Sn 22, ngách 108, ngõ 68', 'Hàng dễ vỡ xin nhẹ tay', '2024-04-05 00:00:00', 'pending', 0, 'express', '2024-04-08', 'cod', 1),
	(18, 15, 'Hà Quang Dương', 'quangduong@gmail.com', '0911725756', 'Sn 22, ngách 108, ngõ 68', 'Hàng dễ vỡ xin nhẹ tay', '2024-04-05 00:00:00', 'pending', 0, 'express', '2024-04-08', 'cod', 1),
	(19, 15, 'Hà Quang Dương', 'quangduong@gmail.com', '0911725756', 'Sn 22, ngách 108, ngõ 68', 'Hàng dễ vỡ xin nhẹ tay', '2024-04-05 00:00:00', 'pending', 0, 'express', '2024-04-08', 'cod', 1),
	(20, 14, 'Trần Đức Anh', 'anhduc21112003@gmail.com', '0865247233', 'Sn 22, ngách 108, ngõ 68', 'Hàng dễ vỡ xin nhẹ tay', '2024-04-05 00:00:00', 'pending', 5000000, 'express', '2024-04-08', 'cod', 1),
	(21, 14, 'Trần Đức Anh', 'anhduc2111gjfjgbnf2003@gmail.com', '0865247233', 'Sn 22, ngách 108, ngõ 68', 'Hàng dễ vỡ xin nhẹ tay', '2024-04-05 00:00:00', 'pending', 5000000, 'express', '2024-04-08', 'cod', 1),
	(22, 14, 'Trần Đức Anh', 'anhduc21112003@gmail.com', '0865247233', 'Sn 22, ngách 108, ngõ 68', 'Hàng dễ vỡ xin nhẹ tay', '2024-04-05 00:00:00', 'pending', 5000000, 'express', '2024-04-08', 'cod', 1),
	(23, 14, 'Trần Đức Anh', 'anhduc21112003@gmail.com', '0865247233', 'Sn 22, ngách 108, ngõ 68', 'Hàng dễ vỡ xin nhẹ tay', '2024-04-05 00:00:00', 'pending', 5000000, 'express', '2024-04-08', 'cod', 1),
	(24, 14, 'Hà Quang Dương', 'qduong2032003@gmail.com', '0865247233', 'Sn 22, ngách 108, ngõ 68', 'Hàng dễ vỡ xin nhẹ tay', '2024-04-05 00:00:00', 'pending', 5000000, 'express', '2024-04-08', 'cod', 1),
	(25, 14, 'Hà Quang Dương', 'quangduong2032003@gmail.com', '0865247233', 'Sn 22, ngách 108, ngõ 68', 'Hàng dễ vỡ xin nhẹ tay', '2024-04-05 00:00:00', 'pending', 5000000, 'express', '2024-04-08', 'cod', 1);

-- Dumping structure for table shopsneaker.order_details
CREATE TABLE IF NOT EXISTS `order_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `price` float DEFAULT NULL CHECK (`price` >= 0),
  `number_of_products` int(11) DEFAULT NULL CHECK (`number_of_products` > 0),
  `total_money` bigint(20) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table shopsneaker.order_details: ~55 rows (approximately)
INSERT INTO `order_details` (`id`, `order_id`, `product_id`, `price`, `number_of_products`, `total_money`, `size`) VALUES
	(1, 2, 1, 798000, 2, 1596000, 43),
	(2, 1, 3, 990000, 1, 3000000, 44),
	(3, 1, 5, 999000, 3, 1890000, 42),
	(4, 5, 5, 39024200, 7, NULL, 0),
	(5, 5, 1, 798000, 2, NULL, 0),
	(6, 5, 3, 24076800, 3, NULL, 0),
	(7, 6, 5, 39024200, 7, NULL, 0),
	(8, 6, 1, 798000, 2, NULL, 0),
	(9, 6, 3, 24076800, 3, NULL, 0),
	(10, 7, 6, 32191800, 3, NULL, 0),
	(11, 7, 4, 53057800, 1, NULL, 0),
	(12, 8, 5, 39024200, 7, NULL, 0),
	(13, 8, 1, 798000, 2, NULL, 0),
	(14, 8, 3, 24076800, 3, NULL, 0),
	(15, 9, 2, 63044700, 12, NULL, 0),
	(16, 9, 3, 24076800, 7, NULL, 0),
	(17, 9, 5, 39024200, 4, NULL, 0),
	(18, 10, 2, 63044700, 1, NULL, 0),
	(19, 10, 7, 73324900, 2, NULL, 0),
	(20, 12, 5, 39024200, 1, 39024200, 43),
	(21, 12, 6, 32191800, 2, 64383600, 43),
	(22, 12, 7, 73324900, 3, 219974688, 43),
	(23, 13, 1, 798000, 2, 1596000, 43),
	(24, 13, 2, 3000000, 3, 9000000, 43),
	(25, 13, 3, 24076800, 4, 96307200, 43),
	(26, 14, 2, 3000000, 4, 12000000, 43),
	(27, 14, 3, 24076800, 6, 144460800, 43),
	(28, 14, 4, 53057800, 8, 424462400, 43),
	(29, 15, 2, 3000000, 4, 12000000, 43),
	(30, 15, 3, 24076800, 6, 144460800, 43),
	(31, 15, 4, 53057800, 8, 424462400, 43),
	(32, 16, 2, 3000000, 1, 3000000, 43),
	(33, 16, 1, 798000, 1, 798000, 43),
	(34, 16, 3, 24076800, 2, 48153512, 43),
	(35, 17, 2, 3000000, 1, 3000000, 43),
	(36, 17, 1, 798000, 1, 798000, 43),
	(37, 17, 3, 24076800, 2, 48153512, 43),
	(38, 18, 2, 3000000, 1, 3000000, 43),
	(39, 18, 1, 798000, 1, 798000, 43),
	(40, 18, 3, 24076800, 2, 48153512, 43),
	(41, 19, 2, 3000000, 1, 3000000, 43),
	(42, 19, 1, 798000, 1, 798000, 43),
	(43, 19, 3, 24076800, 2, 48153512, 43),
	(44, 20, 2, 3000000, 4, 12000000, 43),
	(45, 20, 3, 24076800, 6, 144460536, 43),
	(46, 20, 4, 53057800, 8, 424462720, 43),
	(47, 21, 2, 3000000, 4, 12000000, 43),
	(48, 21, 3, 24076800, 6, 144460536, 43),
	(49, 21, 4, 53057800, 8, 424462720, 43),
	(50, 22, 2, 3000000, 4, 12000000, 43),
	(51, 22, 3, 24076800, 6, 144460536, 43),
	(52, 22, 4, 53057800, 8, 424462720, 43),
	(53, 23, 2, 3000000, 4, 12000000, 43),
	(54, 23, 3, 24076800, 6, 144460536, 43),
	(55, 23, 4, 53057800, 8, 424462720, 43),
	(56, 24, 2, 3000000, 4, 12000000, 43),
	(57, 24, 3, 24076800, 6, 144460536, 43),
	(58, 24, 4, 53057800, 8, 424462720, 43),
	(59, 25, 2, 3000000, 4, 12000000, 43),
	(60, 25, 3, 24076800, 6, 144460536, 43),
	(61, 25, 4, 53057800, 8, 424462720, 43);

-- Dumping structure for table shopsneaker.social_accounts
CREATE TABLE IF NOT EXISTS `social_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider` varchar(20) NOT NULL COMMENT 'Tên nhà social network',
  `provider_id` varchar(50) NOT NULL,
  `email` varchar(150) NOT NULL COMMENT 'Email tài khoản',
  `name` varchar(100) NOT NULL COMMENT 'Tên người dùng',
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `social_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table shopsneaker.social_accounts: ~0 rows (approximately)

-- Dumping structure for table shopsneaker.tokens
CREATE TABLE IF NOT EXISTS `tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `token_type` varchar(50) NOT NULL,
  `expiration_date` datetime DEFAULT NULL,
  `revoked` tinyint(1) NOT NULL,
  `expired` tinyint(1) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table shopsneaker.tokens: ~0 rows (approximately)


-- Dumping structure for table shopsneaker.carts
CREATE TABLE IF NOT EXISTS `carts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK__users` (`user_id`),
  KEY `FK__products` (`product_id`),
  CONSTRAINT `FK__products` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK__users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table shopsneaker.carts: ~1 rows (approximately)
INSERT INTO `carts` (`id`, `user_id`, `product_id`, `quantity`, `size`) VALUES
	(12, 14, 11, 1, 43);
/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
