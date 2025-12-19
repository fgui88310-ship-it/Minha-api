import os, pickle

print("PWD:", os.getcwd())
print("PKL EXISTS:", os.path.exists("pesos_nomes.pkl"))
print("PKL PATH:", os.path.abspath("pesos_nomes.pkl"))

with open("pesos_nomes.pkl", "rb") as f:
    data = pickle.load(f)

print("TIPO:", type(data))