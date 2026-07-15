package com.girsang.stiker.model.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.PrePersist
import jakarta.validation.constraints.NotBlank

@Entity
class DataPenyesuaianStok(
    @Id
    var id: String = "",

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "barang_id")
    var dataBarang: DataBarang,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    var dataPengguna: DataPengguna,

    var tanggal: Long,
    var stokSistem: Long,
    var stokFisik: Long,
    var selisih: Long,
    var pathGambar: String = "",

    @field:NotBlank(message = "Alasan tidak boleh kosong")
    @Column(nullable = false)
    var alasan: String = "-"
){
    @PrePersist
    fun generateId() {
        if (id.isBlank()) {
            id = "PSTK-${System.currentTimeMillis()}-${(100..999).random()}"
        }
    }
}