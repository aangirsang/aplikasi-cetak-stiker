package com.girsang.stiker.repository

import com.girsang.stiker.model.dto.response.download.orderan.RekapOrderanBulananResponse
import com.girsang.stiker.model.entity.DataOrderan
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DataOrderanRepository: JpaRepository<DataOrderan, String> {
        fun findTopByFakturStartingWithOrderByFakturDesc(
        prefix: String
    ): DataOrderan?

    @Query("""
        SELECT o
        FROM DataOrderan o
        WHERE (:awal IS NULL OR o.tanggal >= :awal)
          AND (:akhir IS NULL OR o.tanggal <= :akhir)
        ORDER BY o.tanggal DESC
    """)
    fun findByTanggal(
        awal: Long?,
        akhir: Long?
    ): List<DataOrderan>

    @Query("""
    SELECT new com.girsang.stiker.model.dto.response.download.orderan.RekapOrderanBulananResponse(
        CAST(strftime('%m', datetime(o.tanggal / 1000, 'unixepoch')) AS integer),
        CAST(strftime('%Y', datetime(o.tanggal / 1000, 'unixepoch')) AS integer),
        SUM(o.totalStiker)
    )
    FROM DataOrderan o
    WHERE
            (:awal IS NULL OR o.tanggal >= :awal)
        AND 
            (:akhir IS NULL OR o.tanggal <= :akhir)
    GROUP BY
        strftime('%Y', datetime(o.tanggal / 1000, 'unixepoch')),
        strftime('%m', datetime(o.tanggal / 1000, 'unixepoch'))
    ORDER BY
        strftime('%Y', datetime(o.tanggal / 1000, 'unixepoch')),
        strftime('%m', datetime(o.tanggal / 1000, 'unixepoch'))
""")
    fun getRekapOrderanBulanan(
        awal: Long?,
        akhir: Long?
    ): List<RekapOrderanBulananResponse>
}

