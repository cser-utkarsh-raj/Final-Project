package com.stationery.inventory.repository;

import com.stationery.inventory.model.StationeryItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StationeryItemRepository extends JpaRepository<StationeryItem, Long> {
}
//this also extends JpaRepository, providing CRUD operations for the StationeryItem entity.