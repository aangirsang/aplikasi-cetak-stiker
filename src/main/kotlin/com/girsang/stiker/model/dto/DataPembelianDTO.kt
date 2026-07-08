package com.girsang.stiker.model.dto

import com.girsang.stiker.model.entity.DataBarang
import com.girsang.stiker.model.entity.DataPembelian
import com.girsang.stiker.model.entity.DataPembelianRinci
import com.girsang.stiker.model.entity.DataPengguna
import java.math.BigDecimal

class DataPembelianDTO(
    val id: Long,
    var dataPenggunaId: Long,
    var tanggal: Long,

    var subtotal: BigDecimal = BigDecimal.ZERO,
    var rincian: List<DataPembelianRinciDTO>
){
    companion object{
        fun fromEntity(entity: DataPembelian): DataPembelianDTO {
            return DataPembelianDTO(
                id = entity.id,
                dataPenggunaId = entity.dataPengguna.id,
                tanggal = entity.tanggal,
                subtotal = entity.subtotal,
                rincian = entity.rincian.map { DataPembelianRinciDTO.fromEntity(it) }
            )
        }
    }
}

class DataPembelianRinciDTO(
    val id: Long = 0,
    val dataPembelianId: Long = 0,
    val tanggal: Long = 0,
    var dataBarangId: Long,
    var harga: BigDecimal = BigDecimal.ZERO,
    var jumlah: Long,
    var total: BigDecimal = BigDecimal.ZERO
) {
    companion object{
        fun fromEntity(entity: DataPembelianRinci): DataPembelianRinciDTO{
            return DataPembelianRinciDTO(
                id = entity.id,
                dataPembelianId = entity.dataPembelian.id,
                tanggal = entity.dataPembelian.tanggal,
                dataBarangId = entity.dataBarang.id,
                harga = entity.harga,
                jumlah = entity.jumlah,
                total = entity.total
            )
        }
    }
}