# Sistema ornamental — Édition Gravura v2.3

**Direção:** Art Déco editorial, gravuras botânicas gastronômicas e traços musicais nordestinos, combinados com sobriedade. Referência visual: guia ornamental aprovado na conversa. Artes redesenhadas em SVG original, sem cópia vetorial literal.

## Arquivos e aplicações

| Arquivo | Motivo | Uso no site |
|---|---|---|
| `cantoneira-deco.svg` | leque geométrico, gemas e filetes | canto superior direito da fotografia Hero (desktop) |
| `filete-deco.svg` | diamante central, curvas e raios | apoio ao subtítulo Hero e miniassinatura inferior |
| `selo-anel-deco.svg` | selo com anéis e micropontos | fundo vetorial do selo de 3 palavras no Hero |
| `gravura-abacaxi.svg` | casca com hachuras e folhas | plano de fundo discreto da Gastronomia |
| `gravura-citrico.svg` | laranja, gomo e folhagem | plano de fundo da composição gastronômica |
| `sanfona-linear.svg` | instrumento com foles e botões detalhados | abertura da seção Música |
| `ritmo-poster.svg` | ondas rítmicas, notas e pandeiro | fundo do painel de cartaz musical |
| `cantoneira-cartaz.svg` | cantoneira de leque retro | canto do cartaz da seção Música |
| `flor-musica-culinaria.svg` | floreio simétrico, talher e folhas | assinatura suave em História e Rodapé |

## Regras de acabamento

- As fotos reais, conteúdo e CTA têm sempre prioridade sobre ornamentos.
- Gravuras em planos de fundo são semitransparentes; nunca por cima de preços e textos críticos.
- Cantoneira do Hero é removida em telas compactas; floreio da História é removido no mobile.
- Todos os ornamentos têm `alt=""` e `aria-hidden="true"`; imagens apenas decorativas.
- SVGs leves e independentes, cores coordenadas com a paleta existente.
- Não acrescentar selos repetidos nem animações perpétuas. Respeitar `prefers-reduced-motion`.

## Edição

Para alterar os SVGs, edite diretamente em `fonte/assets/ornamentos/`. Um script opcional (`fonte/scripts/generate-ornaments.py`) gera a série original; **executá-lo sobrescreve** os nove SVGs da pasta. O script utiliza somente a biblioteca padrão Python.
