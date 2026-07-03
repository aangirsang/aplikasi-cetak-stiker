package com.girsang.stiker.model.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import java.math.BigDecimal

@Entity
class DataPembelian (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    var dataPengguna: DataPengguna,

    var tanggal: Long,
    var jenisPembelian: String = "",
    var subtotal: BigDecimal = BigDecimal.ZERO,

    @OneToMany(mappedBy = "dataPembelian", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var rincian: MutableList<DataPembelianRinci> = mutableListOf()
)