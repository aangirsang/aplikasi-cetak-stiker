package com.girsang.stiker.model.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne

@Entity
class DataPengguna(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    var namaLengkap: String = "",

    @Column(nullable = false, unique = true)
    var namaPengguna: String = "",

    @Column(nullable = false)
    var kataSandi: String? = "",

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn
    var dataLevel: DataLevel,

    var status: Boolean = true,
    var pathGambar: String = ""
)