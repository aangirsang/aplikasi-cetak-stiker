package com.girsang.stiker.model.entity

import jakarta.persistence.*

@Entity
class DataLayoutCetak(

    @Id
    var id: String = "",

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, unique = true)
    var dataStiker: DataStiker,

    @Column(nullable = true)
    var pathTIF: String = "",

    @Column(nullable = false)
    var lebarKertas: Double,

    @Column(nullable = false)
    var tinggiKertas: Double,

    @Column(nullable = false)
    var offsetX: Double = 0.0,

    @Column(nullable = false)
    var offsetY: Double = 0.0,

    @Column(nullable = false)
    var width: Double = 0.0,

    @Column(nullable = false)
    var height: Double = 0.0,

    @Column(nullable = false)
    var dpiX: Double = 0.0,

    @Column(nullable = false)
    var dpiY: Double = 0.0,

    @Column(nullable = false)
    var imageWidthMM: Double = 0.0,

    @Column(nullable = false)
    var imageHeightMM: Double = 0.0,

    @Column(nullable = false)
    var dibuatPada: Long = System.currentTimeMillis(),

    @Column(nullable = false)
    var diubahPada: Long = System.currentTimeMillis()
){
    @PrePersist
    fun generateId() {
        if (id.isBlank()) {
            id = "DLC-${System.currentTimeMillis()}-${(100..999).random()}"
        }
    }
}