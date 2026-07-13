package com.girsang.stiker.model.entity

import com.girsang.stiker.config.JenisRiwayatStok
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.PrePersist

@Entity
class DataRiwayatStok(

    @Id
    var id: String = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barang_id")
    var dataBarang: DataBarang,

    var tanggal: Long,

    @Enumerated(EnumType.STRING)
    var jenis: JenisRiwayatStok,

    var referensiId: String,
    var perubahan: Long,
    var saldoAwal: Long = 0,
    var saldoAkhir: Long,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pengguna_id")
    var dataPengguna: DataPengguna,

    var keterangan: String? = null
){
    @PrePersist
    fun generateId() {
        if (id.isBlank()) {
            id = "RSTK-${System.currentTimeMillis()}-${(100..999).random()}"
        }
    }
}