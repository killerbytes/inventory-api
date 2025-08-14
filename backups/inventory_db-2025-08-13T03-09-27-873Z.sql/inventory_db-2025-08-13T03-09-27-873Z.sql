-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: inventory_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `order` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Finishing Materials','Finishing materials enhance the appearance and protection of buildings and structures',2),(2,'Screws','Threaded Fasteners',1),(3,'Building Materials','Building materials are the substances used in the construction of structures',0);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `combinationvalues`
--

DROP TABLE IF EXISTS `combinationvalues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `combinationvalues` (
  `combinationId` int NOT NULL,
  `variantValueId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`combinationId`,`variantValueId`),
  UNIQUE KEY `CombinationValues_variantValueId_combinationId_unique` (`combinationId`,`variantValueId`),
  KEY `variantValueId` (`variantValueId`),
  CONSTRAINT `combinationvalues_ibfk_1` FOREIGN KEY (`combinationId`) REFERENCES `productcombinations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `combinationvalues_ibfk_2` FOREIGN KEY (`variantValueId`) REFERENCES `variantvalues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `combinationvalues`
--

LOCK TABLES `combinationvalues` WRITE;
/*!40000 ALTER TABLE `combinationvalues` DISABLE KEYS */;
INSERT INTO `combinationvalues` VALUES (1,2,'2025-08-13 02:16:59','2025-08-13 02:16:59'),(2,1,'2025-08-13 02:16:59','2025-08-13 02:16:59'),(3,6,'2025-08-13 02:21:01','2025-08-13 02:21:01'),(4,7,'2025-08-13 02:21:01','2025-08-13 02:21:01'),(5,8,'2025-08-13 02:21:01','2025-08-13 02:21:01'),(6,9,'2025-08-13 02:21:01','2025-08-13 02:21:01'),(7,10,'2025-08-13 02:31:20','2025-08-13 02:31:20'),(7,13,'2025-08-13 02:31:20','2025-08-13 02:31:20'),(8,11,'2025-08-13 02:31:20','2025-08-13 02:31:20'),(8,13,'2025-08-13 02:31:20','2025-08-13 02:31:20'),(9,10,'2025-08-13 02:31:20','2025-08-13 02:31:20'),(9,14,'2025-08-13 02:31:20','2025-08-13 02:31:20'),(10,11,'2025-08-13 02:31:20','2025-08-13 02:31:20'),(10,14,'2025-08-13 02:31:20','2025-08-13 02:31:20'),(11,15,'2025-08-13 03:04:58','2025-08-13 03:04:58'),(11,17,'2025-08-13 03:04:58','2025-08-13 03:04:58'),(12,15,'2025-08-13 03:04:58','2025-08-13 03:04:58'),(12,18,'2025-08-13 03:04:58','2025-08-13 03:04:58'),(13,16,'2025-08-13 03:04:58','2025-08-13 03:04:58'),(13,17,'2025-08-13 03:04:58','2025-08-13 03:04:58'),(14,16,'2025-08-13 03:04:58','2025-08-13 03:04:58'),(14,18,'2025-08-13 03:04:58','2025-08-13 03:04:58');
/*!40000 ALTER TABLE `combinationvalues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventories`
--

DROP TABLE IF EXISTS `inventories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `combinationId` int DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `combinationId` (`combinationId`),
  CONSTRAINT `inventories_ibfk_1` FOREIGN KEY (`combinationId`) REFERENCES `productcombinations` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventories`
--

LOCK TABLES `inventories` WRITE;
/*!40000 ALTER TABLE `inventories` DISABLE KEYS */;
INSERT INTO `inventories` VALUES (1,1,3,'2025-08-13 02:16:59','2025-08-13 03:01:26'),(2,2,0,'2025-08-13 02:16:59','2025-08-13 02:16:59'),(3,3,10,'2025-08-13 02:21:01','2025-08-13 03:01:46'),(4,4,0,'2025-08-13 02:21:01','2025-08-13 02:21:01'),(5,5,10,'2025-08-13 02:21:01','2025-08-13 03:01:46'),(6,6,0,'2025-08-13 02:21:01','2025-08-13 02:21:01'),(7,7,5,'2025-08-13 02:31:20','2025-08-13 03:01:26'),(8,8,0,'2025-08-13 02:31:20','2025-08-13 02:31:20'),(9,9,0,'2025-08-13 02:31:20','2025-08-13 02:31:20'),(10,10,0,'2025-08-13 02:31:20','2025-08-13 02:31:20'),(11,11,0,'2025-08-13 03:04:58','2025-08-13 03:04:58'),(12,12,0,'2025-08-13 03:04:58','2025-08-13 03:04:58'),(13,13,0,'2025-08-13 03:04:58','2025-08-13 03:04:58'),(14,14,0,'2025-08-13 03:04:58','2025-08-13 03:04:58');
/*!40000 ALTER TABLE `inventories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventorybreakpacks`
--

DROP TABLE IF EXISTS `inventorybreakpacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventorybreakpacks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fromCombinationId` int NOT NULL,
  `toCombinationId` int NOT NULL,
  `fromQuantity` int NOT NULL,
  `toQuantity` int NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventorybreakpacks`
--

LOCK TABLES `inventorybreakpacks` WRITE;
/*!40000 ALTER TABLE `inventorybreakpacks` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventorybreakpacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventorymovements`
--

DROP TABLE IF EXISTS `inventorymovements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventorymovements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('IN','OUT','ADJUST','RETURN','CANCEL_PURCHASE','BREAK_PACK','RE_PACK') NOT NULL,
  `previous` int NOT NULL,
  `new` int NOT NULL,
  `quantity` int NOT NULL,
  `reference` int NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL,
  `combinationId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `combinationId` (`combinationId`),
  CONSTRAINT `inventorymovements_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `inventorymovements_ibfk_2` FOREIGN KEY (`combinationId`) REFERENCES `productcombinations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventorymovements`
--

LOCK TABLES `inventorymovements` WRITE;
/*!40000 ALTER TABLE `inventorymovements` DISABLE KEYS */;
INSERT INTO `inventorymovements` VALUES (1,'IN',0,5,5,1,NULL,'2025-08-13 03:01:26','2025-08-13 03:01:26',1,7),(2,'IN',0,3,3,1,NULL,'2025-08-13 03:01:26','2025-08-13 03:01:26',1,1),(3,'IN',0,10,10,3,NULL,'2025-08-13 03:01:46','2025-08-13 03:01:46',1,3),(4,'IN',0,10,10,3,NULL,'2025-08-13 03:01:46','2025-08-13 03:01:46',1,5);
/*!40000 ALTER TABLE `inventorymovements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productcombinations`
--

DROP TABLE IF EXISTS `productcombinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productcombinations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int DEFAULT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `reorderLevel` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `productId` (`productId`),
  CONSTRAINT `productcombinations_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productcombinations`
--

LOCK TABLES `productcombinations` WRITE;
/*!40000 ALTER TABLE `productcombinations` DISABLE KEYS */;
INSERT INTO `productcombinations` VALUES (1,1,'01|KWI_ENT_KN|BOX|SAT_NIC',500.00,10,'2025-08-13 02:16:59','2025-08-13 02:16:59',NULL),(2,1,'01|KWI_ENT_KN|BOX|SAT_CHR',550.00,10,'2025-08-13 02:16:59','2025-08-13 02:16:59',NULL),(3,2,'01|ROY_WID_SE|BOX|1_GAN_WD1',100.00,10,'2025-08-13 02:21:01','2025-08-13 02:21:01',NULL),(4,2,'01|ROY_WID_SE|BOX|2_GAN_WD1',120.00,10,'2025-08-13 02:21:01','2025-08-13 02:21:01',NULL),(5,2,'01|ROY_WID_SE|BOX|3_GAN_WD1',130.00,10,'2025-08-13 02:21:01','2025-08-13 02:21:01',NULL),(6,2,'01|ROY_WID_SE|BOX|SUR_BOX_RU',50.00,10,'2025-08-13 02:21:01','2025-08-13 02:21:01',NULL),(7,3,'02|BLA_SCR|BOX|1_|WOO',25.00,10,'2025-08-13 02:31:20','2025-08-13 02:31:20',NULL),(8,3,'02|BLA_SCR|BOX|2|WOO',30.00,10,'2025-08-13 02:31:20','2025-08-13 02:31:20',NULL),(9,3,'02|BLA_SCR|BOX|1_|MET',25.00,10,'2025-08-13 02:31:20','2025-08-13 02:31:20',NULL),(10,3,'02|BLA_SCR|BOX|2|MET',31.00,10,'2025-08-13 02:31:20','2025-08-13 02:31:20',NULL),(11,4,'03|PLY|PCS|14|MAR',900.00,10,'2025-08-13 03:04:58','2025-08-13 03:04:58',NULL),(12,4,'03|PLY|PCS|14|ORD',800.00,10,'2025-08-13 03:04:58','2025-08-13 03:04:58',NULL),(13,4,'03|PLY|PCS|38|MAR',1300.00,10,'2025-08-13 03:04:58','2025-08-13 03:04:58',NULL),(14,4,'03|PLY|PCS|38|ORD',1100.00,10,'2025-08-13 03:04:58','2025-08-13 03:04:58',NULL);
/*!40000 ALTER TABLE `productcombinations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `unit` varchar(255) NOT NULL,
  `categoryId` int NOT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_name_unit` (`name`,`unit`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Kwikset Entry Knob Tylo',NULL,'BOX',1,'01|KWI_ENT_KN','2025-08-13 02:15:28','2025-08-13 02:15:28',NULL),(2,'ROYU Wide Series Universal Outlet',NULL,'BOX',1,'01|ROY_WID_SE','2025-08-13 02:18:09','2025-08-13 02:18:09',NULL),(3,'Black Screw',NULL,'BOX',2,'02|BLA_SCR','2025-08-13 02:29:01','2025-08-13 02:29:01',NULL),(4,'Plywood',NULL,'PCS',3,'03|PLY','2025-08-13 03:03:24','2025-08-13 03:03:24',NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchaseorderitems`
--

DROP TABLE IF EXISTS `purchaseorderitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchaseorderitems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchaseOrderId` int DEFAULT NULL,
  `combinationId` int DEFAULT NULL,
  `quantity` int DEFAULT '0',
  `originalPrice` decimal(10,2) DEFAULT '0.00',
  `purchasePrice` decimal(10,2) DEFAULT '0.00',
  `totalAmount` decimal(10,2) DEFAULT '0.00',
  `discount` decimal(10,2) DEFAULT '0.00',
  `unit` varchar(255) DEFAULT NULL,
  `discountNote` text,
  `skuSnapshot` varchar(255) DEFAULT NULL,
  `nameSnapshot` varchar(255) DEFAULT NULL,
  `categorySnapshot` json DEFAULT NULL,
  `variantSnapshot` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `purchaseOrderId` (`purchaseOrderId`),
  KEY `combinationId` (`combinationId`),
  CONSTRAINT `purchaseorderitems_ibfk_1` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchaseorders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `purchaseorderitems_ibfk_2` FOREIGN KEY (`combinationId`) REFERENCES `productcombinations` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchaseorderitems`
--

LOCK TABLES `purchaseorderitems` WRITE;
/*!40000 ALTER TABLE `purchaseorderitems` DISABLE KEYS */;
INSERT INTO `purchaseorderitems` VALUES (1,1,7,5,25.00,25.00,125.00,NULL,'BOX','','02|BLA_SCR|BOX|1_|WOO','Black Screw','{\"id\": 2, \"name\": \"Screws\", \"order\": 0, \"description\": \"Threaded Fasteners\"}','{\"Size\": \"1\\\" \", \"Type\": \"Wood\"}','2025-08-13 03:01:26','2025-08-13 03:01:26'),(2,1,1,3,500.00,500.00,1500.00,NULL,'BOX','','01|KWI_ENT_KN|BOX|SAT_NIC','Kwikset Entry Knob Tylo','{\"id\": 1, \"name\": \"Finishing Materials\", \"order\": 1, \"description\": \"Finishing materials enhance the appearance and protection of buildings and structures\"}','{\"Color\": \"Satin Nickel\"}','2025-08-13 03:01:26','2025-08-13 03:01:26'),(3,3,3,10,100.00,100.00,1000.00,NULL,'BOX','','01|ROY_WID_SE|BOX|1_GAN_WD1','ROYU Wide Series Universal Outlet','{\"id\": 1, \"name\": \"Finishing Materials\", \"order\": 1, \"description\": \"Finishing materials enhance the appearance and protection of buildings and structures\"}','{\"Size\": \"1 Gang WD111 \"}','2025-08-13 03:01:46','2025-08-13 03:01:46'),(4,3,5,10,130.00,130.00,1300.00,NULL,'BOX','','01|ROY_WID_SE|BOX|3_GAN_WD1','ROYU Wide Series Universal Outlet','{\"id\": 1, \"name\": \"Finishing Materials\", \"order\": 1, \"description\": \"Finishing materials enhance the appearance and protection of buildings and structures\"}','{\"Size\": \"3 Gang WD115 \"}','2025-08-13 03:01:46','2025-08-13 03:01:46'),(5,5,13,50,1300.00,1300.00,65000.00,NULL,'PCS','','03|PLY|PCS|38|MAR','Plywood','{\"id\": 3, \"name\": \"Building Materials\", \"order\": 0, \"description\": \"Building materials are the substances used in the construction of structures\"}','{\"Size\": \"3/8\", \"Type\": \"Marine\"}','2025-08-13 03:05:53','2025-08-13 03:05:53'),(6,5,12,55,800.00,800.00,44000.00,NULL,'PCS','','03|PLY|PCS|14|ORD','Plywood','{\"id\": 3, \"name\": \"Building Materials\", \"order\": 0, \"description\": \"Building materials are the substances used in the construction of structures\"}','{\"Size\": \"1/4\\\"\", \"Type\": \"Ordinary\"}','2025-08-13 03:05:53','2025-08-13 03:05:53');
/*!40000 ALTER TABLE `purchaseorderitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchaseorders`
--

DROP TABLE IF EXISTS `purchaseorders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchaseorders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchaseOrderNumber` varchar(255) NOT NULL,
  `supplierId` int NOT NULL,
  `status` enum('PENDING','RECEIVED','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `deliveryDate` datetime DEFAULT NULL,
  `cancellationReason` text,
  `totalAmount` decimal(10,2) NOT NULL,
  `notes` text,
  `internalNotes` text,
  `modeOfPayment` enum('CASH','CHECK') DEFAULT 'CHECK',
  `checkNumber` varchar(255) DEFAULT NULL,
  `dueDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchaseOrderNumber` (`purchaseOrderNumber`),
  UNIQUE KEY `checkNumber` (`checkNumber`),
  KEY `supplierId` (`supplierId`),
  CONSTRAINT `purchaseorders_ibfk_1` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchaseorders`
--

LOCK TABLES `purchaseorders` WRITE;
/*!40000 ALTER TABLE `purchaseorders` DISABLE KEYS */;
INSERT INTO `purchaseorders` VALUES (1,'9379322',1,'RECEIVED','2025-08-13 02:10:50',NULL,1625.00,NULL,NULL,'CHECK','12312344','2025-08-20 02:10:50','2025-08-13 02:59:50','2025-08-13 03:01:26'),(3,'6795284',1,'RECEIVED','2025-08-13 02:58:20',NULL,2300.00,NULL,NULL,'CASH',NULL,'2025-08-20 02:58:20','2025-08-13 03:01:06','2025-08-13 03:01:46'),(5,'67952845',1,'PENDING','2025-08-13 02:58:20',NULL,109000.00,NULL,NULL,'CHECK','2323','2025-08-20 02:58:20','2025-08-13 03:05:53','2025-08-13 03:05:53');
/*!40000 ALTER TABLE `purchaseorders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchaseorderstatushistories`
--

DROP TABLE IF EXISTS `purchaseorderstatushistories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchaseorderstatushistories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchaseOrderId` int DEFAULT NULL,
  `status` enum('PENDING','RECEIVED','COMPLETED','CANCELLED') DEFAULT NULL,
  `changedBy` int DEFAULT NULL,
  `changedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `purchaseOrderId` (`purchaseOrderId`),
  KEY `changedBy` (`changedBy`),
  CONSTRAINT `purchaseorderstatushistories_ibfk_1` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchaseorders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `purchaseorderstatushistories_ibfk_2` FOREIGN KEY (`changedBy`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchaseorderstatushistories`
--

LOCK TABLES `purchaseorderstatushistories` WRITE;
/*!40000 ALTER TABLE `purchaseorderstatushistories` DISABLE KEYS */;
INSERT INTO `purchaseorderstatushistories` VALUES (1,1,'PENDING',1,'2025-08-13 02:59:50','2025-08-13 02:59:50','2025-08-13 02:59:50',NULL),(2,3,'PENDING',1,'2025-08-13 03:01:06','2025-08-13 03:01:06','2025-08-13 03:01:06',NULL),(3,1,'RECEIVED',1,'2025-08-13 03:01:26','2025-08-13 03:01:26','2025-08-13 03:01:26',NULL),(4,3,'RECEIVED',1,'2025-08-13 03:01:46','2025-08-13 03:01:46','2025-08-13 03:01:46',NULL),(5,5,'PENDING',1,'2025-08-13 03:05:53','2025-08-13 03:05:53','2025-08-13 03:05:53',NULL);
/*!40000 ALTER TABLE `purchaseorderstatushistories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salesorderitems`
--

DROP TABLE IF EXISTS `salesorderitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salesorderitems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `inventoryId` int NOT NULL,
  `quantity` int NOT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `originalPrice` decimal(10,2) DEFAULT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `inventoryId` (`inventoryId`),
  CONSTRAINT `salesorderitems_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `salesorders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `salesorderitems_ibfk_2` FOREIGN KEY (`inventoryId`) REFERENCES `inventories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salesorderitems`
--

LOCK TABLES `salesorderitems` WRITE;
/*!40000 ALTER TABLE `salesorderitems` DISABLE KEYS */;
/*!40000 ALTER TABLE `salesorderitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salesorders`
--

DROP TABLE IF EXISTS `salesorders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salesorders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer` varchar(255) NOT NULL,
  `orderDate` datetime NOT NULL,
  `status` enum('PENDING','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `deliveryDate` datetime DEFAULT NULL,
  `receivedDate` datetime DEFAULT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `receivedBy` int DEFAULT NULL,
  `notes` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `orderBy` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `receivedBy` (`receivedBy`),
  KEY `orderBy` (`orderBy`),
  CONSTRAINT `salesorders_ibfk_1` FOREIGN KEY (`receivedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `salesorders_ibfk_2` FOREIGN KEY (`orderBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salesorders`
--

LOCK TABLES `salesorders` WRITE;
/*!40000 ALTER TABLE `salesorders` DISABLE KEYS */;
/*!40000 ALTER TABLE `salesorders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` text,
  `address` varchar(255) NOT NULL,
  `notes` text,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'Citi Hardware',NULL,NULL,'+63','Mayapyap',NULL,1,'2025-08-13 02:12:00','2025-08-13 02:12:00');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `isActive` tinyint(1) DEFAULT '0',
  `isAdmin` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Joel Carlos','killerbytes','joelcarlos02@gmail.com','$2b$08$tk9gNtKgGQBc28p6/pXLBeGWRxYmLN83R0n6t5Y9gTqlWMU9egF02',1,0,'2025-08-13 02:10:45','2025-08-13 02:10:45',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `varianttypes`
--

DROP TABLE IF EXISTS `varianttypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `varianttypes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `productId` int DEFAULT NULL,
  `isTemplate` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `productId` (`productId`),
  CONSTRAINT `varianttypes_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `varianttypes`
--

LOCK TABLES `varianttypes` WRITE;
/*!40000 ALTER TABLE `varianttypes` DISABLE KEYS */;
INSERT INTO `varianttypes` VALUES (1,'Color',1,NULL,'2025-08-13 02:16:09','2025-08-13 02:16:09'),(3,'Size',2,NULL,'2025-08-13 02:19:51','2025-08-13 02:19:51'),(4,'Size',3,NULL,'2025-08-13 02:30:09','2025-08-13 02:30:09'),(5,'Type',3,NULL,'2025-08-13 02:30:30','2025-08-13 02:30:30'),(6,'Size',4,NULL,'2025-08-13 03:03:50','2025-08-13 03:03:50'),(7,'Type',4,NULL,'2025-08-13 03:04:14','2025-08-13 03:04:14');
/*!40000 ALTER TABLE `varianttypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variantvalues`
--

DROP TABLE IF EXISTS `variantvalues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variantvalues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` varchar(255) DEFAULT NULL,
  `variantTypeId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `variantTypeId` (`variantTypeId`),
  CONSTRAINT `variantvalues_ibfk_1` FOREIGN KEY (`variantTypeId`) REFERENCES `varianttypes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variantvalues`
--

LOCK TABLES `variantvalues` WRITE;
/*!40000 ALTER TABLE `variantvalues` DISABLE KEYS */;
INSERT INTO `variantvalues` VALUES (1,'Satin Chrome',1,'2025-08-13 02:16:09','2025-08-13 02:16:09'),(2,'Satin Nickel',1,'2025-08-13 02:16:09','2025-08-13 02:16:09'),(6,'1 Gang WD111 ',3,'2025-08-13 02:19:51','2025-08-13 02:19:51'),(7,'2 Gang WD113 ',3,'2025-08-13 02:19:51','2025-08-13 02:19:51'),(8,'3 Gang WD115 ',3,'2025-08-13 02:19:51','2025-08-13 02:19:51'),(9,'Surface Box RUB2',3,'2025-08-13 02:19:51','2025-08-13 02:19:51'),(10,'1\" ',4,'2025-08-13 02:30:09','2025-08-13 02:30:09'),(11,'2\"',4,'2025-08-13 02:30:09','2025-08-13 02:30:09'),(12,'3\"',4,'2025-08-13 02:30:09','2025-08-13 02:30:09'),(13,'Wood',5,'2025-08-13 02:30:30','2025-08-13 02:30:30'),(14,'Metal',5,'2025-08-13 02:30:30','2025-08-13 02:30:30'),(15,'1/4\"',6,'2025-08-13 03:03:50','2025-08-13 03:03:50'),(16,'3/8',6,'2025-08-13 03:03:50','2025-08-13 03:03:50'),(17,'Marine',7,'2025-08-13 03:04:14','2025-08-13 03:04:14'),(18,'Ordinary',7,'2025-08-13 03:04:14','2025-08-13 03:04:14');
/*!40000 ALTER TABLE `variantvalues` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-13 11:09:27
