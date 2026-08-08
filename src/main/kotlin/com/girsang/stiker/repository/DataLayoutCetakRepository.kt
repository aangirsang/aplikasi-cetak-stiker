package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataLayoutCetak
import org.springframework.data.jpa.repository.JpaRepository

interface DataLayoutCetakRepository: JpaRepository<DataLayoutCetak, String> {
    fun findByDataStikerId(stikerId: String): DataLayoutCetak?
}