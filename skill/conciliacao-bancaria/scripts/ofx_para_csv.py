#!/usr/bin/env python3
"""Converte um extrato OFX (SGML 1.x ou XML 2.x) em CSV na saída padrão.

Uso: python3 ofx_para_csv.py extrato.ofx > extrato.csv

Colunas: data (AAAA-MM-DD), valor (ponto decimal, débito negativo), tipo, historico, documento, fitid.
Lê só o arquivo informado; não acessa rede nem grava outros arquivos.
"""
import csv
import re
import sys


def ler(caminho):
    # Bancos brasileiros costumam gerar OFX em latin-1; tenta UTF-8 primeiro.
    bruto = open(caminho, "rb").read()
    for codificacao in ("utf-8", "latin-1"):
        try:
            return bruto.decode(codificacao)
        except UnicodeDecodeError:
            continue
    return bruto.decode("latin-1", errors="replace")


def campo(bloco, nome):
    # Funciona com <TAG>valor (SGML, sem fechamento) e <TAG>valor</TAG> (XML).
    m = re.search(rf"<{nome}>([^<\r\n]*)", bloco, re.IGNORECASE)
    return m.group(1).strip() if m else ""


def data_iso(valor):
    digitos = re.sub(r"\D", "", valor)[:8]
    return f"{digitos[0:4]}-{digitos[4:6]}-{digitos[6:8]}" if len(digitos) == 8 else valor


def valor_decimal(valor):
    v = valor.strip().replace(" ", "")
    if "," in v and "." in v:
        v = v.replace(".", "").replace(",", ".")
    elif "," in v:
        v = v.replace(",", ".")
    return v


def main():
    if len(sys.argv) != 2:
        print(__doc__, file=sys.stderr)
        sys.exit(2)
    texto = ler(sys.argv[1])
    blocos = re.findall(r"<STMTTRN>(.*?)(?=</STMTTRN>|<STMTTRN>|</BANKTRANLIST>)", texto, re.IGNORECASE | re.DOTALL)
    saida = csv.writer(sys.stdout)
    saida.writerow(["data", "valor", "tipo", "historico", "documento", "fitid"])
    for b in blocos:
        historico = " ".join(x for x in (campo(b, "NAME"), campo(b, "MEMO")) if x)
        saida.writerow([
            data_iso(campo(b, "DTPOSTED")),
            valor_decimal(campo(b, "TRNAMT")),
            campo(b, "TRNTYPE"),
            historico,
            campo(b, "CHECKNUM") or campo(b, "REFNUM"),
            campo(b, "FITID"),
        ])
    print(f"{len(blocos)} movimentos convertidos", file=sys.stderr)


if __name__ == "__main__":
    main()
