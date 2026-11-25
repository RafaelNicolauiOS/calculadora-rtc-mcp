# Diagnóstico da rejeição REG-011 (carne bovina)

**O que aconteceu**
A Calculadora recusou o item porque o NCM 02013000 (carne bovina fresca ou refrigerada, desossada) foi enviado com a cClassTrib 200035, que é de produtos de higiene pessoal e limpeza (Anexo VIII). Esse NCM não está vinculado a essa classificação. É um erro de entrada (`INCONSISTENCIA_ENTRADA`), então a correção é sua, no dado enviado.

**Onde**
- Item: `#/itens/3`, ou seja, o 4º item da nota (a contagem começa em 0).
- Campo: `ncm` (NCM 02013000), em conflito com a cClassTrib 200035.

**Como corrigir**
- Troque a classificação do item para **cClassTrib 200003** (CST 200), "Vendas de produtos destinados à alimentação humana (Anexo I)", a Cesta Básica Nacional. O NCM 0201 (carnes bovinas frescas ou refrigeradas) está listado nesse anexo. Fonte: Art. 125 da LC 214/2025, com redução de 100% de CBS e IBS (alíquota zero).
- A classificação 200003 é aceita em NF-e e NFC-e. Se a nota for de outro tipo de documento, pode surgir REG-029.
- Confirme pela descrição que o item é mesmo carne bovina in natura/refrigerada. Se for um produto industrializado de outra posição, o NCM e a classificação mudam.
- Mantenha o NCM com 8 dígitos (02013000). Com 200003 o código completo é exigido (REG-015).
- A 200035 provavelmente foi cadastrada por engano no item (CST 200 com a classificação errada de redução de 60%). Se a classificação já vinha do cadastro, os demais itens com esse produto vão dar o mesmo erro.

**Evite que se repita**
Este é um erro de **cadastro**: ajuste a cClassTrib do produto "carne bovina" (NCM 02013000) no ERP para 200003. Assim a correção vale para todas as notas futuras. Se existirem outros cortes bovinos no cadastro (NCM 0201/0202), revise todos de uma vez. É um problema só, com a mesma causa.

Depois de corrigir, reenvie o cálculo. Se a rejeição persistir com outro código, mande a nova mensagem completa.
