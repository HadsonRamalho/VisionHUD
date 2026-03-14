# HUD Video Processor

## Descrição

Sistema composto por uma API em Rust e um frontend em Next.js para o processamento de videos com detecção de objetos. A aplicação utiliza o modelo YOLOv8 para identificar elementos em cada frame, desenhando caixas de delimitação e linhas conectoras dinâmicas. O processamento pesado é realizado por um executavel Python (Sidecar) invocado pelo backend, que tambem utiliza FFmpeg para a mixagem opcional de áudio e conversão de codec para compatibilidade universal (H.264).

## Requisitos

* Rust e Cargo para execução do servidor.
* FFmpeg instalado e disponível no PATH do sistema.
* Executavel do rastreador (tracker) gerado via PyInstaller e localizado no diretorio `./binaries/`.
* Node.js e gerenciador de pacotes (npm/pnpm/yarn) para o frontend.

## Como Usar

### Backend (Rust)

1. Certifique-se de que o executável do processador Python esteja em `./src-back/binaries/tracker-x86_64-pc-windows-msvc.exe` (ou ajuste o caminho no código).
2. Configure as variáveis de ambiente se necessário.
3. Inicie o servidor:
```bash
cargo run
```

A API rodará na porta `3061`.

### Frontend (Next.js)

1. Instale as dependências:
```bash
npm install

```

2. Configure a variável de ambiente `NEXT_PUBLIC_API_URL` apontando para o servidor Rust.
3. Inicie o ambiente de desenvolvimento:
```bash
npm run dev

```



### Fluxo de Operacao

1. Acesse a Dashboard.
2. Faca o upload de um arquivo de vídeo (obrigatório).
3. Faca o upload de um arquivo de áudio (opcional).
4. Defina o nome do arquivo de saída.
5. Clique em "Iniciar Processamento".
6. O sistema enviará os dados via Multipart Form para o backend, processará os frames e disparará o download automático do arquivo final em formato MP4.
