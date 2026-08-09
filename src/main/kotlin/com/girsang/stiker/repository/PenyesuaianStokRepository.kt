package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataPenyesuaianStok
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface PenyesuaianStokRepository: JpaRepository<DataPenyesuaianStok, String> {
    @Query("""
        SELECT p
        FROM DataPenyesuaianStok p
        WHERE 
            (:awal IS NULL OR p.tanggal >= :awal)
        AND
            (:akhir IS NULL OR p.tanggal <= :akhir)
        ORDER BY p.tanggal DESC
    """)
    fun downloadPenyesuaianStok(
        awal: Long?,
        akhir: Long?,
    ): List<DataPenyesuaianStok>
}