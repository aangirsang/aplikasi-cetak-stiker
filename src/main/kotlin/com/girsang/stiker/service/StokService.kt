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

    @Transactional
    fun tambahStok(
        barangId: String,
        jumlah: Long,
        jenis: JenisRiwayatStok,
        referensiId: String,
        pengguna: DataPengguna,
        keterangan: String? = null
    ) {

        val barang = repoBarang.findById(barangId)
            .orElseThrow { IllegalArgumentException("Barang tidak ditemukan") }

        barang.stokBarang += jumlah

        repoRiwayat.save(
            DataRiwayatStok(
                dataBarang = barang,
                tanggal = System.currentTimeMillis(),
                jenis = jenis,
                referensiId = referensiId,
                perubahan = jumlah,
                saldoAwal = 0,
                saldoAkhir = 0,
                dataPengguna = pengguna,
                keterangan = keterangan
            )
        )

        hitungUlangSaldo(barang.id)
    }

    @Transactional
    fun ubahStok(
        referensiId: String,
        barangId: String,
        jumlahBaru: Long,
        pengguna: DataPengguna,
        keterangan: String? = null
    ) {

        println("Refrensi ID : $referensiId")
        println("Barang ID : $barangId")
        println("Ubah Riwayat")

        val riwayat = repoRiwayat.findByReferensiIdAndDataBarangId(
            referensiId,
            barangId
        ) ?: throw IllegalArgumentException("Riwayat tidak ditemukan")

        println("Refrensi ID : $referensiId")
        println("Barang ID : $barangId")
        println("Ubah Riwayat")

        val barang = riwayat.dataBarang

        // Batalkan pengaruh lama
        barang.stokBarang -= riwayat.perubahan

        // Terapkan pengaruh baru
        barang.stokBarang += jumlahBaru

        riwayat.perubahan = jumlahBaru
        riwayat.tanggal = System.currentTimeMillis()
        riwayat.dataPengguna = pengguna
        riwayat.keterangan = keterangan

        repoRiwayat.save(riwayat)

        hitungUlangSaldo(barang.id)
    }

    @Transactional
    fun hapusStok(
        referensiId: String,
        barangId: String
    ) {

        println("Refrensi ID : $referensiId")
        println("Barang ID : $barangId")
        println("Hapus Riwayat")

        val riwayat = repoRiwayat.findByReferensiIdAndDataBarangId(
            referensiId,
            barangId
        ) ?: throw IllegalArgumentException("Riwayat tidak ditemukan")

        println("Refrensi ID : $referensiId")
        println("Barang ID : $barangId")
        println("Hapus Riwayat")


        val barang = riwayat.dataBarang

        barang.stokBarang -= riwayat.perubahan

        repoRiwayat.delete(riwayat)

        hitungUlangSaldo(barang.id)
    }

    @Transactional
    fun hitungUlangSaldo(barangId: String) {

        val daftar = repoRiwayat
            .findByDataBarangIdOrderByTanggalAsc(barangId)

        var saldo = 0L

        daftar.forEach {

            it.saldoAwal = saldo

            saldo += it.perubahan

            it.saldoAkhir = saldo

        }

        repoRiwayat.saveAll(daftar)
    }

}