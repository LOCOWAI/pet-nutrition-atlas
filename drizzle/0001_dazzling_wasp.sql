CREATE TABLE `breeds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`species` enum('cat','dog') NOT NULL,
	`breedName` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`overview` text,
	`commonIssues` json,
	`nutritionFocus` json,
	`imageUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `breeds_id` PRIMARY KEY(`id`),
	CONSTRAINT `breeds_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `content_angles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paperId` int NOT NULL,
	`formatType` enum('xiaohongshu','ecommerce_detail','faq','video_script','infographic','brand_education','social_post','scientific_brief') NOT NULL,
	`titleIdea` varchar(512),
	`consumerSummary` text,
	`professionalSummary` text,
	`riskNote` text,
	`targetAudience` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_angles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paper_breeds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paperId` int NOT NULL,
	`breedId` int NOT NULL,
	`relevanceScore` float DEFAULT 1,
	CONSTRAINT `paper_breeds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paper_topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paperId` int NOT NULL,
	`topicId` int NOT NULL,
	CONSTRAINT `paper_topics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `papers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`authors` text NOT NULL,
	`year` int NOT NULL,
	`journal` varchar(256),
	`doi` varchar(256),
	`url` varchar(512),
	`abstract` text,
	`species` enum('cat','dog','both','other') NOT NULL,
	`lifeStage` enum('junior','adult','senior','all') NOT NULL DEFAULT 'all',
	`studyType` enum('review','rct','observational','in_vitro','meta_analysis','case_study','cohort','other') NOT NULL,
	`evidenceLevel` enum('high','medium','low') NOT NULL DEFAULT 'medium',
	`breedRelevance` varchar(256),
	`keywords` json,
	`coreSummary` text,
	`keyFindings` json,
	`practicalRelevance` text,
	`limitations` text,
	`harvardReference` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`featured` boolean NOT NULL DEFAULT false,
	`aiGenerated` boolean NOT NULL DEFAULT false,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `papers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`description` text,
	`species` enum('cat','dog','both') NOT NULL DEFAULT 'both',
	`iconCode` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `topics_id` PRIMARY KEY(`id`),
	CONSTRAINT `topics_name_unique` UNIQUE(`name`),
	CONSTRAINT `topics_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `update_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runDate` timestamp NOT NULL DEFAULT (now()),
	`source` varchar(128) NOT NULL,
	`totalFound` int NOT NULL DEFAULT 0,
	`totalImported` int NOT NULL DEFAULT 0,
	`totalFlagged` int NOT NULL DEFAULT 0,
	`status` enum('running','completed','failed') NOT NULL DEFAULT 'completed',
	`notes` text,
	`triggeredBy` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `update_logs_id` PRIMARY KEY(`id`)
);
