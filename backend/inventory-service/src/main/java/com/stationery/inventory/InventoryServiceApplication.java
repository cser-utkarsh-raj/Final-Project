package com.stationery.inventory;

import com.stationery.inventory.model.Category;
import com.stationery.inventory.model.StationeryItem;
import com.stationery.inventory.repository.StationeryItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;

@EnableDiscoveryClient
@SpringBootApplication
public class InventoryServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(InventoryServiceApplication.class, args);
    }

    //it seeds the database with initial stationery items if the repository is empty, ensuring that there are some default items available for testing or demonstration purposes when the application starts up
    @Bean
    CommandLineRunner seedItems(StationeryItemRepository items) {
        return args -> {
            if (items.count() == 0) {
                items.save(new StationeryItem("A4 Copier Paper", Category.PAPER, "ream", 120, 25));
                items.save(new StationeryItem("Blue Ball Pen", Category.PEN, "piece", 300, 60));
                items.save(new StationeryItem("Classmate Notebook", Category.NOTEBOOK, "piece", 90, 20));
            }
        };
    }
}
