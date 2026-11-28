package com.girsang.stiker.repository

import com.girsang.stiker.model.dto.response.DataTabelOrderanResponse
import com.girsang.stiker.model.dto.response.OrderanTabelResponse
import com.girsang.stiker.model.dto.response.download.orderan.RekapOrderanBulananResponse
import com.girsang.stiker.model.entity.DataOrderan
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DataOrderanRepository: JpaRepository<DataOrderan, String> {

    @EntityGraph(attributePaths = ["dataPengguna", "dataPengguna.dataLevel", "dataUMKM"])
    override fun findAll(): List<DataOrderan>

    @EntityGraph(attributePaths = [
        "dataPengguna", "dataPengguna.dataLevel", "dataUMKM",
        "rincian", "rincian.dataStiker", "rincian.dataStiker.dataUmkm",
        "rincian.dataStiker.dataBarang", "rincian.dataStiker.layoutCetak"
    ])
    @Query("select o from DataOrderan o")
    fun findAllLengkap(): List<DataOrderan>

    fun findTopByFakturStartingWithOrderByFakturDesc(
        prefix: String
    ): DataOrderan?

    @EntityGraph(attributePaths = [
        "dataPengguna", "dataPengguna.dataLevel", "dataUMKM",
        "rincian", "rincian.dataStiker", "rincian.dataStiker.dataUmkm",
        "rincian.dataStiker.dataBarang", "rincian.dataStiker.layoutCetak"
    ])
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


    //YANG BARU
    @Query(
        value = """
        SELECT new com.girsang.stiker.model.dto.response.OrderanTabelResponse(
            o.id, o.faktur, o.tanggal, o.dataUMKM.namaUsaha, o.totalStiker
        )
        FROM DataOrderan o
        WHERE (:awal IS NULL OR o.tanggal >= :awal)
          AND (:akhir IS NULL OR o.tanggal <= :akhir)
          AND (:kata IS NULL
               OR LOWER(o.faktur) LIKE LOWER(CONCAT('%', :kata, '%'))
               OR LOWER(o.dataUMKM.namaUsaha) LIKE LOWER(CONCAT('%', :kata, '%')))
        ORDER BY o.tanggal DESC, o.id DESC
    """,
        countQuery = """
        SELECT COUNT(o)
        FROM DataOrderan o
        WHERE (:awal IS NULL OR o.tanggal >= :awal)
          AND (:akhir IS NULL OR o.tanggal <= :akhir)
          AND (:kata IS NULL
               OR LOWER(o.faktur) LIKE LOWER(CONCAT('%', :kata, '%'))
               OR LOWER(o.dataUMKM.namaUsaha) LIKE LOWER(CONCAT('%', :kata, '%')))
    """
    )
    fun findTabel(
        awal: Long?,
        akhir: Long?,
        kata: String?,
        pageable: Pageable
    ): Page<OrderanTabelResponse>

    @Query("""
    SELECT COALESCE(SUM(o.totalStiker), 0L)
    FROM DataOrderan o
    WHERE (:awal IS NULL OR o.tanggal >= :awal)
      AND (:akhir IS NULL OR o.tanggal <= :akhir)
      AND (:kata IS NULL
           OR LOWER(o.faktur) LIKE LOWER(CONCAT('%', :kata, '%'))
           OR LOWER(o.dataUMKM.namaUsaha) LIKE LOWER(CONCAT('%', :kata, '%')))
""")
    fun totalCetak(
        awal: Long?,
        akhir: Long?,
        kata: String?
    ): Long


}

