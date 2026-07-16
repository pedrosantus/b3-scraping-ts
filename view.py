import json
import os

pasta = './data'
arquivos = os.listdir(pasta)

lista_conteudos = []

for arquivo in arquivos:
    caminho_completo = os.path.join(pasta, arquivo)
    with open(caminho_completo, 'r', encoding='utf-8') as f:
            conteudo = json.load(f)
            lista_conteudos.extend(conteudo)

        


with open('dados.json', 'w') as f:
    json.dump(lista_conteudos, f, indent=4)
