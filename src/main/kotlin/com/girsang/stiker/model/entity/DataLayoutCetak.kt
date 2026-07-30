package com.girsang.stiker.model.entity

import jakarta.persistence.*

@Entity
class DataLayoutCetak(

    @Id
    var id: String = "",

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, unique = true)
    var dataStiker: DataStiker,

    @Column(nullable = false)
    var lebarKertas: Double,

    @Column(nullable = false)
    var tinggiKertas: Double,

    @Column(nullable = false)
    var offsetX: Double = 0.0,

    @Column(nullable = false)
    var offsetY: Double = 0.0,

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