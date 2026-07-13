package com.girsang.stiker.model.entity

import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.PrePersist
import java.math.BigDecimal
import kotlin.text.isBlank

@Entity
class DataPembelianRinci (
    @Id
    var id: String ="",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pembelian_id")
    var dataPembelian: DataPembelian,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    var dataBarang: DataBarang,

    var harga: BigDecimal = BigDecimal.ZERO,
    var jumlah: Long,
    var total: BigDecimal = BigDecimal.ZERO
){
    @PrePersist
    fun generateId() {
        if (id.isBlank()) {
            id = "BUYS-${System.currentTimeMillis()}-${(100..999).random()}"
        }
    }
}