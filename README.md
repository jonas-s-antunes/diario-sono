# Diário do Sono 😴

Um aplicativo mobile desenvolvido com Expo e React Native para rastrear e analisar seus padrões de sono.

## Funcionalidades

- 📝 **Registrar Sono**: Registre horários de dormir, acordar e outras métricas de sono
- 📊 **Estatísticas**: Visualize médias de tempo de sono, eficiência e qualidade
- 📈 **Histórico**: Acompanhe seu histórico completo de registros de sono
- 💾 **Exportar**: Exporte seus dados em formato CSV
- ✏️ **Editar**: Modifique registros existentes
- 🗑️ **Deletar**: Remova registros quando necessário

## Métricas Rastreadas

- **Tempo de Cama (TIB)**: Tempo entre deitar e levantar
- **Tempo Total de Sono (TST)**: Tempo realmente dormindo
- **Eficiência do Sono**: Percentual de TST em relação a TIB
- **Qualidade do Sono**: Avaliação de 1-10
- **Disposição**: Como você se sentiu ao acordar (1-10)
- **Ansiedade**: Nível de ansiedade (1-10)
- **Despertares**: Número de vezes que acordou durante a noite
- **Cafeína**: Se consumiu cafeína após 14h
- **Exercício**: Quando fez exercício (manhã/tarde/noite)

## Tecnologias

- **Expo**: Framework para desenvolvimento de apps React Native
- **Expo Router**: Navegação baseada em arquivo (file-based routing)
- **React Native**: Framework para desenvolvimento mobile
- **AsyncStorage**: Armazenamento local de dados
- **TypeScript**: Type safety em todo o projeto

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/jonas-s-antunes/diario-sono.git
cd diario-sono
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o projeto:
```bash
npm start
```

4. Use o Expo Go para visualizar no seu dispositivo:
   - Android: Escaneie o QR code com o Expo Go
   - iOS: Escaneie o QR code com a câmera

## Estrutura do Projeto

```
├── app/                   # Telas e navegação (Expo Router)
│   ├── (tabs)/            # Telas principais com tabs
│   │   ├── index.tsx      # Home - Lista de registros
│   │   ├── two.tsx        # Resumo - Estatísticas e export
│   │   └── _layout.tsx    # Layout das tabs
│   └── registro/          # Telas de registro
│       ├── novo.tsx       # Criar novo registro
│       ├── [id].tsx       # Detalhes do registro
│       └── editar/
│           └── [id].tsx   # Editar registro
├── components/            # Componentes reutilizáveis
│   ├── DatePicker.tsx
│   └── TimePicker.tsx
├── storage/              # Camada de persistência
│   ├── entries.ts        # CRUD de registros
│   └── export.ts         # Exportação CSV
├── types/                # Tipos TypeScript
│   └── sleep.ts          # Tipo SleepEntry
└── constants/            # Constantes da app
```

## Como Usar

### Criar um novo registro
1. Clique no botão flutuante (+) na home
2. Preencha os horários de dormir/acordar
3. Complete as métricas (qualidade, disposição, etc)
4. Clique em "Salvar"

### Ver estatísticas
1. Acesse a aba "Resumo"
2. Visualize as médias dos últimos 7 registros
3. Veja o histórico detalhado
4. Exporte para CSV se necessário

### Editar um registro
1. Clique no registro que deseja editar
2. Clique em "Editar"
3. Modifique os dados
4. Clique em "Salvar"

## Contribuindo

Este é um projeto pessoal. Sinta-se livre para fazer fork e adaptar para suas necessidades.

## Licença

MIT - veja LICENSE para detalhes
