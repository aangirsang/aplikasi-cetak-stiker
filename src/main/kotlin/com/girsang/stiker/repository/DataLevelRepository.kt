package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataLevel
import org.springframework.data.jpa.repository.JpaRepository

interface DataLevelRepository: JpaRepository<DataLevel, Long> {
    fun existsByLevelIgnoreCase(level: String): Boolean
    fun existsByLevelIgnoreCaseAndIdNot(level: String, id: Long): Boolean
}