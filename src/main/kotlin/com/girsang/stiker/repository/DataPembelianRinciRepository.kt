package com.girsang.stiker.repository

import com.girsang.stiker.model.entity.DataPembelianRinci
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DataPembelianRinciRepository: JpaRepository<DataPembelianRinci, String> {
    @Query("""
        SELECT  p
        FROM DataPembelianRinci p
        WHERE 
            (:awal IS NULL OR p.dataPembelian.tanggal >= :awal)
        AND
            (:akhir IS NULL OR p.dataPembelian.tanggal <= :akhir)
        ORDER BY
            p.dataPembelian.tanggal DESC
        
    """)
    fun downloadPembelianRinci(
        awal: Long?,
        akhir: Long?
    ): List<DataPembelianRinci>
}