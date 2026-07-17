package com.girsang.stiker.model.entity

import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.PrePersist

@Entity
data class DataOrderanRinci (
    @Id
    var id: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orderan_id")
    var dataOrderan: DataOrderan,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "stiker_id")
    var dataStiker: DataStiker,

    var jumlah: Int
){
    @PrePersist
    fun generateId() {
        if (id.isBlank()) {
            id = "ORDRS-${System.currentTimeMillis()}-${(100..999).random()}"
        }
    }
}