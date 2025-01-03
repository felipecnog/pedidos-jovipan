/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.6.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: xsw_jovipan
-- ------------------------------------------------------
-- Server version	11.6.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  `endereco` text NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES
(15,'Felipe Campos Nogueira','85982057590','Rua General Bernardo','2024-12-26 17:00:42'),
(16,'Tiago Magalhães','85997933381','Sem','2024-12-26 19:25:21'),
(17,'Leontino','85999402813','Av Jovita Feitosa 1196','2024-12-31 13:32:24');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(12) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `envio` varchar(100) DEFAULT NULL,
  `observacoes` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `status` enum('feito','em preparação','finalizado','enviado','concluído') NOT NULL DEFAULT 'feito',
  `hora_envio` time DEFAULT NULL,
  `pagamento` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  UNIQUE KEY `codigo_2` (`codigo`),
  UNIQUE KEY `codigo_3` (`codigo`),
  KEY `cliente_id` (`cliente_id`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES
(25,'419396',16,'retirada','e','2024-12-27 16:19:45','em preparação',NULL,NULL),
(27,'281187',15,'envio','teste','2024-12-29 15:58:53','em preparação',NULL,NULL),
(28,'895459',16,'envio','teste','2024-12-29 17:00:10','feito',NULL,NULL),
(29,'393327',15,'retirada','','2024-12-29 17:06:38','enviado',NULL,NULL),
(36,'376174',15,'envio','','2024-12-31 18:22:01','feito','15:00:00','dinheiros'),
(37,'414238',17,'envio','','2024-12-31 23:38:26','feito','23:38:00','100%'),
(38,'698771',17,'envio',NULL,'2025-01-01 22:49:10','feito','15:50:00','Não pagou');
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produtos`
--

DROP TABLE IF EXISTS `produtos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `produtos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `variacoes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`variacoes`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produtos`
--

LOCK TABLES `produtos` WRITE;
/*!40000 ALTER TABLE `produtos` DISABLE KEYS */;
INSERT INTO `produtos` VALUES
(5,'Cento Salgado Frito','2024-12-30 10:24:54','[\"25x Coxinha\",\"25x Canudinho\",\"25x Bolinha de Queijo\",\"25x Pastel de Carne\",\"25x Pastel de Queijo\"]'),
(7,'Torta Doce 15','2024-12-30 11:36:14','[\"Maracujá\",\"Limão\",\"Doce de Leite\",\"Crocante\",\"Prestígio\",\"Sonho de Valsa\",\"Chocolate\",\"Brigadeiro\",\"Ninho\"]'),
(8,'Torta Doce 25','2024-12-31 13:48:24','[\"Maracujá\",\"Limão\",\"Doce de Leite\",\"Crocante\",\"Prestígio\",\"Sonho de Valsa\",\"Chocolate\",\"Brigadeiro\",\"Ninho\"]');
/*!40000 ALTER TABLE `produtos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produtos_pedido`
--

DROP TABLE IF EXISTS `produtos_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `produtos_pedido` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pedido_codigo` varchar(12) DEFAULT NULL,
  `produto` varchar(100) NOT NULL,
  `detalhes` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pedido_codigo` (`pedido_codigo`),
  CONSTRAINT `produtos_pedido_ibfk_1` FOREIGN KEY (`pedido_codigo`) REFERENCES `pedidos` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produtos_pedido`
--

LOCK TABLES `produtos_pedido` WRITE;
/*!40000 ALTER TABLE `produtos_pedido` DISABLE KEYS */;
INSERT INTO `produtos_pedido` VALUES
(3,'419396','torta','[\"Maracujá\"]'),
(10,'281187','teste','teste'),
(13,'281187','teste2','teste2'),
(15,'895459','teste','teste'),
(16,'895459','teste4','teste4'),
(25,'393327','Cento Salgado Frito','25x Coxinha, 25x Canudinho, 25x Bolinha de Queijo, 25x Pastel de Carne'),
(26,'393327','Torta Doce 15','Sonho de Valsa'),
(27,'393327','Torta Doce 15','Sonho de Valsa'),
(28,'393327','Cento Salgado Frito','25x Coxinha, 25x Canudinho, 25x Bolinha de Queijo, 25x Pastel de Carne, 25x Pastel de Queijo'),
(31,'393327','Cento Salgado Frito','25x Bolinha de Queijo'),
(32,'376174','Cento Salgado Frito','25x Canudinho'),
(33,'376174','Cento Salgado Frito',''),
(34,'414238','Cento Salgado Frito','25x Coxinha, 25x Canudinho, 25x Bolinha de Queijo, 25x Pastel de Carne'),
(35,'414238','Torta Doce 15','Doce de Leite'),
(36,'414238','Torta Doce 25','Chocolate');
/*!40000 ALTER TABLE `produtos_pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  `senha` varchar(255) NOT NULL,
  `status` enum('ativo','bloqueado') DEFAULT 'ativo',
  `categoria` enum('administrador','utilizador') DEFAULT 'utilizador',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES
(39,'admin','$2a$10$Zw6x5kckyo4H7Ev7DzH.gu9nTFCakJJ6DWDq3f2yPgHSvZ75/jNzy','ativo','administrador'),
(40,'user','$2a$10$48hQmEOnj321LMQgRAqBo.s5VCKq0QWy9LIidTH6/bxsEW4Av6xV2','ativo','utilizador'),
(41,'felipe','$2b$10$k2cO3B3QL1CeLmfkHrrZ7Oi1OtFBhvxyuCrWk49Znt8.wDaV7T3JW','ativo','administrador');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variacoes`
--

DROP TABLE IF EXISTS `variacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `variacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `produto_id` int(11) NOT NULL,
  `variacao` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `produto_id` (`produto_id`),
  CONSTRAINT `variacoes_ibfk_1` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variacoes`
--

LOCK TABLES `variacoes` WRITE;
/*!40000 ALTER TABLE `variacoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `variacoes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-01-01 20:03:08
