package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataOrderan
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DataOrderanRepository: JpaRepository<DataOrderan, String> {
    fun countByTanggalBetween(
        awal: Long,
        akhir: Long
    ): Long

    fun findTopByFakturStartingWithOrderByFakturDesc(
        prefix: String
    ): DataOrderan?
}