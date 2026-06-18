package com.stationery.inventory.repository;

import com.stationery.inventory.model.StationeryItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StationeryItemRepository extends JpaRepository<StationeryItem, Long> {
}
