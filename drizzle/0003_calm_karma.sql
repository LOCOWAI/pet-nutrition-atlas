CREATE TABLE `guidelines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`organization` enum('AAHA','WSAVA','other') NOT NULL,
	`year` int NOT NULL,
	`category` enum('nutrition','dental','senior_care','weight_management','kidney','liver','cardiac','dermatology','oncology','reproduction','general_health') NOT NULL DEFAULT 'general_health',
	`species` enum('cat','dog','both') NOT NULL DEFAULT 'both',
	`life_stage` enum('junior','adult','senior','all') NOT NULL DEFAULT 'all',
	`summary` text,
	`summary_zh` text,
	`key_recommendations` json,
	`related_health_topics` json,
	`reference_url` varchar(512),
	`harvard_reference` text,
	`status` enum('pending','published','archived') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guidelines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `content_angles` MODIFY COLUMN `formatType` enum('xiaohongshu','ecommerce_detail','faq','video_script','infographic','brand_education','social_post','scientific_brief','blog_article','email_campaign','product_claim','vet_education') NOT NULL;--> statement-breakpoint
ALTER TABLE `papers` ADD `abstract_zh` text;--> statement-breakpoint
ALTER TABLE `papers` ADD `summary_zh` text;--> statement-breakpoint
ALTER TABLE `papers` ADD `consumer_summary_zh` text;--> statement-breakpoint
ALTER TABLE `papers` ADD `ingredients` json;--> statement-breakpoint
ALTER TABLE `papers` ADD `ingredient_mappings` json;--> statement-breakpoint
ALTER TABLE `papers` ADD `infographic_type` varchar(64);--> statement-breakpoint
ALTER TABLE `papers` ADD `infographic_data` json;