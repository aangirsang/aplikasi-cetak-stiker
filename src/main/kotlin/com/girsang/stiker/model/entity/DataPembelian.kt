package com.girsang.stiker.model.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.PrePersist
import java.math.BigDecimal

@Entity
class DataPembelian (
    @Id
    var id: String = "",

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    var dataPengguna: DataPengguna,

    var tanggal: Long,
    var subtotal: BigDecimal = BigDecimal.ZERO,

    @OneToMany(mappedBy = "dataPembelian", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var rincian: MutableList<DataPembelianRinci> = mutableListOf()
){
    @PrePersist
    fun generateId() {
        if (id.isBlank()) {
            id = "BUY-${System.currentTimeMillis()}-${(100..999).random()}"
        }
    }
}