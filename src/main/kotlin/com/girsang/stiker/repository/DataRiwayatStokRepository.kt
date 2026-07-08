package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataRiwayatStok
import org.springframework.data.jpa.repository.JpaRepository

interface DataRiwayatStokRepository: JpaRepository<DataRiwayatStok, Long> {
    fun findByDataBarangId(barangId: Long): List<DataRiwayatStok>
}