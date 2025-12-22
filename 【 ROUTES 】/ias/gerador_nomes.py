#!/usr/bin/env python3
# gerador_nomes.py - Versão para API com PyTorch

import torch
import numpy as np
import json
import sys
import os
import time
import traceback

# Caminho relativo a partir da raiz /workspace
WEIGHTS_FILE = '【 ROUTES 】/ias/makiseV1.pth'

class RealModel:
    def __init__(self, device='cpu'):
        self.vocab_size = 38
        self.hidden_size = 256
        self.embed_dim = 128
        self.scale = 0.1
        self.device = device
        
        # Inicializar camadas
        self.E = None
        self.lstm = None
        self.fc = None
    
    def load(self):
        if not os.path.exists(WEIGHTS_FILE):
            raise FileNotFoundError(f"Arquivo {WEIGHTS_FILE} não encontrado")
        
        # Carregar weights do numpy
        import numpy as np
        data = np.load(WEIGHTS_FILE, allow_pickle=True)
        
        # Converter para tensores PyTorch
        self.E = torch.from_numpy(data['embedding.weight'].astype(np.float32) * self.scale).to(self.device)
        
        # Configurar LSTM manualmente
        Wxi0 = torch.from_numpy(data['lstm.weight_ih_l0'].astype(np.float32) * self.scale).to(self.device)
        Whi0 = torch.from_numpy(data['lstm.weight_hh_l0'].astype(np.float32) * self.scale).to(self.device)
        b_ih0 = torch.from_numpy(data['lstm.bias_ih_l0'].astype(np.float32) * (self.scale * 0.5)).to(self.device)
        b_hh0 = torch.from_numpy(data['lstm.bias_hh_l0'].astype(np.float32) * (self.scale * 0.5)).to(self.device)
        self.bi0 = (b_ih0 + b_hh0)
        
        Wxi1 = torch.from_numpy(data['lstm.weight_ih_l1'].astype(np.float32) * self.scale).to(self.device)
        Whi1 = torch.from_numpy(data['lstm.weight_hh_l1'].astype(np.float32) * self.scale).to(self.device)
        b_ih1 = torch.from_numpy(data['lstm.bias_ih_l1'].astype(np.float32) * (self.scale * 0.5)).to(self.device)
        b_hh1 = torch.from_numpy(data['lstm.bias_hh_l1'].astype(np.float32) * (self.scale * 0.5)).to(self.device)
        self.bi1 = (b_ih1 + b_hh1)
        
        # Armazenar weights
        self.Wxi0 = Wxi0
        self.Whi0 = Whi0
        self.Wxi1 = Wxi1
        self.Whi1 = Whi1
        
        # Camada final
        self.Wo = torch.from_numpy(data['fc.weight'].astype(np.float32) * self.scale).to(self.device)
        self.bo = torch.from_numpy(data['fc.bias'].astype(np.float32) * (self.scale * 0.3)).to(self.device)
        
        data.close()
        return self.vocab_size
    
    def lstm_cell(self, x, h, c, Wx, Wh, b):
        """Implementação manual da célula LSTM"""
        gates = torch.matmul(Wx, x) + torch.matmul(Wh, h) + b
        
        # Dividir gates
        i, f, g, o = torch.split(gates, self.hidden_size)
        
        i = torch.sigmoid(i)
        f = torch.sigmoid(f)
        g = torch.tanh(g)
        o = torch.sigmoid(o)
        
        c_new = f * c + i * g
        h_new = o * torch.tanh(c_new)
        
        return h_new, c_new
    
    def step(self, char_idx, h0, c0, h1, c1):
        """Passo forward"""
        x = self.E[char_idx]
        
        # Primeira camada LSTM
        h0, c0 = self.lstm_cell(x, h0, c0, self.Wxi0, self.Whi0, self.bi0)
        
        # Segunda camada LSTM
        h1, c1 = self.lstm_cell(h0, h1, c1, self.Wxi1, self.Whi1, self.bi1)
        
        # Camada final
        logits = torch.matmul(self.Wo, h1) + self.bo
        
        return logits, h0, c0, h1, c1

def softmax(x, temperature=1.0):
    """Softmax com temperatura"""
    if temperature != 1.0:
        x = x / temperature
    return torch.softmax(x, dim=0)

def gerar_nome_real(model, char_to_idx, idx_to_char, temperature=0.8):
    """Gera um nome usando o modelo"""
    # Inicializar estados
    h0 = torch.zeros((256,), dtype=torch.float32, device=model.device)
    c0 = torch.zeros((256,), dtype=torch.float32, device=model.device)
    h1 = torch.zeros((256,), dtype=torch.float32, device=model.device)
    c1 = torch.zeros((256,), dtype=torch.float32, device=model.device)
    
    # Letra inicial
    start_letters = ['a', 'e', 'i', 'o', 'm', 'j', 's', 'r', 't', 'l', 'c', 'd']
    start_char = torch.tensor(np.random.choice(start_letters))
    char_idx = torch.tensor(char_to_idx.get(start_char.item() if torch.is_tensor(start_char) else start_char, 2), 
                          device=model.device)
    
    generated = []
    
    for step in range(30):
        try:
            logits, h0, c0, h1, c1 = model.step(char_idx, h0, c0, h1, c1)
            
            # Aplicar softmax com temperatura
            probs = softmax(logits, temperature)
            
            # Amostrar próximo caractere
            next_idx = torch.multinomial(probs, 1).item()
            next_char = idx_to_char.get(next_idx, '?')
            
            if next_char == '\n':
                if len(generated) >= 2:
                    break
                continue
            
            generated.append(next_char)
            char_idx = torch.tensor(next_idx, device=model.device)
            
            # Critérios de parada
            if next_char == ' ' and len(generated) >= 3:
                break
            if len(generated) >= 15:
                break
                
        except Exception as e:
            break
    
    return ''.join(generated).strip()

def processar_nome_gerado(texto, idx_to_char):
    """Processa e formata o nome gerado"""
    if not texto:
        return None
    
    texto = texto.lower()
    limpo = []
    for c in texto:
        if c.isalpha():
            limpo.append(c)
        elif c.isspace() and limpo and limpo[-1] != ' ':
            limpo.append(' ')
    
    texto_limpo = ''.join(limpo).strip()
    
    if not texto_limpo:
        return None
    
    palavras = texto_limpo.split()
    palavras_filtradas = []
    for p in palavras:
        if 2 <= len(p) <= 10:
            palavras_filtradas.append(p[0].upper() + p[1:])
    
    if not palavras_filtradas:
        return None
    
    return ' '.join(palavras_filtradas)

def main():

# === ADICIONE ESTAS 3 LINHAS DE DEPURAÇÃO ===
    import sys
    print(f"[DEBUG] Diretório atual: {os.getcwd()}", file=sys.stderr)
    print(f"[DEBUG] Caminho do script: {__file__}", file=sys.stderr)
    print(f"[DEBUG] Buscando modelo em: {os.path.abspath(WEIGHTS_FILE)}", file=sys.stderr)
    # ===========================================
    try:
        # Verificar se CUDA está disponível
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        # Parâmetros da API
        params = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
        quantidade = params.get('quantidade', 1)
        temperature = params.get('temperature', 1.0)
        
        # Vocabulário
        vocab = ['\n', ' ']
        vocab.extend([chr(i) for i in range(ord('a'), ord('z')+1)])
        while len(vocab) < 38:
            vocab.append(chr(ord('A') + len(vocab) - 28))
        
        char_to_idx = {ch: i for i, ch in enumerate(vocab)}
        idx_to_char = {i: ch for i, ch in enumerate(vocab)}
        
        # Modelo
        model = RealModel(device=device)
        model.load()
        
        # Gerar nomes
        nomes = []
        start_time = time.time()
        
        for i in range(quantidade * 3):
            if len(nomes) >= quantidade:
                break
            
            texto_bruto = gerar_nome_real(model, char_to_idx, idx_to_char, temperature)
            nome = processar_nome_gerado(texto_bruto, idx_to_char)
            
            if nome:
                palavras = nome.split()
                if (1 <= len(palavras) <= 3 and 
                    all(2 <= len(p) <= 10 for p in palavras) and
                    nome not in nomes):
                    nomes.append(nome)
        
        # Fallback se necessário
        if not nomes:
            import numpy as np
            prefixos = ["Mar", "Jon", "Alex", "Luc", "Jul", "Ped", "Sof", "Mat", "Lau", "Car"]
            sufixos = ["ia", "as", "to", "ana", "iano", "erte", "ro", "ia", "eus", "ra"]
            for _ in range(quantidade):
                p = np.random.choice(prefixos)
                s = np.random.choice(sufixos)
                nome = p + s
                if len(nome) >= 4:
                    nomes.append(nome)
        
        elapsed = time.time() - start_time
        
        result = {
            "nomes": nomes[:quantidade],
            "quantidade": len(nomes[:quantidade]),
            "temperature": temperature,
            "tempo_geracao": f"{elapsed:.3f}s",
            "observacao": "gerado_pelo_modelo" if len(nomes) > 0 else "fallback",
            "sucesso": True,
            "device": device
        }
        
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        error_result = {
            "sucesso": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        
            # === ADICIONE ESTA LINHA ===
    print(f"ERRO INTERNO NO PYTHON: {error_result}", file=sys.stderr)
    # ===========================
        
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()
    