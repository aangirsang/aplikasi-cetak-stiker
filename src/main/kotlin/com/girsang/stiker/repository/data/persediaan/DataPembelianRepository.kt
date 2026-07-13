package com.girsang.stiker.repository.data.persediaan

import com.girsang.stiker.model.entity.DataPembelian
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DataPembelianRepository: JpaRepository<DataPembelian, String> {
    @Query("""
        SELECT o FROM DataPembelian o 
        LEFT JOIN FETCH o.rincian 
        ORDER BY o.tanggal DESC
        """)
    fun cariSemua(): List<DataPembelian>
}