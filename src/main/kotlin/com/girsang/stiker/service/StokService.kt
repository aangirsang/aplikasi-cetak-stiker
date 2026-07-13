package com.girsang.stiker.service

import com.girsang.stiker.config.JenisRiwayatStok
import com.girsang.stiker.model.entity.DataPengguna
import com.girsang.stiker.model.entity.DataRiwayatStok
import com.girsang.stiker.repository.DataBarangRepository
import com.girsang.stiker.repository.DataRiwayatStokRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service

@Service
@Transactional
class StokService(

    private val repoBarang: DataBarangRepository,
    private val repoRiwayat: DataRiwayatStokRepository

) {

    fun tambahStok(
        barangId: String,
        jumlah: Long,
        jenis: JenisRiwayatStok,
        referensiId: String,
        pengguna: DataPengguna,
        keterangan: String? = null
    ) {

        val barang = repoBarang.findById(barangId)
            .orElseThrow {IllegalArgumentException("Barang tidak ditemukan")}

        val saldoAwal = barang.stokBarang

        barang.stokBarang += jumlah

        repoRiwayat.save(
            DataRiwayatStok(
                dataBarang = barang,
                tanggal = System.currentTimeMillis(),
                jenis = jenis,
                referensiId = referensiId,
                perubahan = jumlah,
                saldoAwal = saldoAwal,
                saldoAkhir = barang.stokBarang,
                dataPengguna = pengguna,
                keterangan = keterangan
            )
        )

    }

    fun kurangiStok(
        barangId: String,
        jumlah: Long,
        jenis: JenisRiwayatStok,
        referensiId: String,
        pengguna: DataPengguna,
        keterangan: String? = null
    ) {

        val barang = repoBarang.findById(barangId)
            .orElseThrow {IllegalArgumentException("Barang tidak ditemukan")}

        if(barang.stokBarang < jumlah){
            throw IllegalArgumentException("Stok tidak cukup")
        }
        val saldoAwal = barang.stokBarang

        barang.stokBarang -= jumlah

        repoRiwayat.save(
            DataRiwayatStok(
                dataBarang = barang,
                tanggal = System.currentTimeMillis(),
                jenis = jenis,
                referensiId = referensiId,
                perubahan = -jumlah,
                saldoAwal = saldoAwal,
                saldoAkhir = barang.stokBarang,
                dataPengguna = pengguna,
                keterangan = keterangan
            )
        )

    }

}