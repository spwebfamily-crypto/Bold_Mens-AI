# 🎨 BoldMens AI — Plano de Design iOS (Codex)

> Objetivo: Replicar fielmente o design de boldmens.co na app iOS
> PASSO OBRIGATÓRIO: O Codex deve ler os ficheiros abaixo do repo
> `spwebfamily-crypto/boldmens-salon` ANTES de escrever qualquer código

---

## 📥 PASSO 1 — EXTRAIR DESIGN DO SITE (OBRIGATÓRIO)

O Codex deve executar estes comandos no repositório `boldmens-salon`:

```bash
# Ler ficheiros de design do site original
cat tailwind.config.js
cat tailwind.config.ts
cat src/index.css
cat src/styles/globals.css
cat src/App.tsx
cat src/App.jsx
cat index.html  # para ver <link> de Google Fonts no <head>
```

**Procurar especificamente:**
- `colors:` ou `--color-` → copiar TODOS os valores hex exatos
- `fontFamily:` ou `--font-` → copiar nomes das fontes
- `@import url(fonts.googleapis.com` → URL exata das fontes
- Qualquer variável CSS custom (`--primary`, `--accent`, `--background`)
- Classes utilitárias mais usadas nos componentes (ex: `text-amber-500`, `bg-zinc-900`)

**Usar esses valores EXATOS** no ficheiro `constants/tokens.ts` da app.
Não inventar cores — replicar pixel a pixel.

---

## 🎨 PASSO 2 — SISTEMA DE TOKENS (preencher com valores reais extraídos)

Criar o ficheiro `constants/tokens.ts`:

```typescript
// ─────────────────────────────────────────────────────────────────────
// TOKENS EXTRAÍDOS DE boldmens.co / tailwind.config.js
// Substituir os valores placeholder pelos valores REAIS do site
// ─────────────────────────────────────────────────────────────────────

export const Colors = {
  // ── FUNDOS (extrair do site) ──────────────────────────────────────
  background:       'EXTRAIR_DO_SITE',  // fundo principal (provavelmente ~#0A0A0A)
  backgroundCard:   'EXTRAIR_DO_SITE',  // fundo de cards
  backgroundInput:  'EXTRAIR_DO_SITE',  // fundo de inputs
  backgroundMuted:  'EXTRAIR_DO_SITE',  // fundo de elementos secundários
  border:           'EXTRAIR_DO_SITE',  // cor de bordas

  // ── COR DE DESTAQUE / ACCENT (extrair do site) ───────────────────
  // (provavelmente dourado/âmbar — verificar no tailwind.config.js)
  accent:           'EXTRAIR_DO_SITE',  // cor principal de destaque
  accentLight:      'EXTRAIR_DO_SITE',  // versão clara do accent
  accentDark:       'EXTRAIR_DO_SITE',  // versão escura do accent
  accentAlpha:      'EXTRAIR_DO_SITE',  // accent com transparência (para backgrounds)

  // ── TEXTO (extrair do site) ───────────────────────────────────────
  textPrimary:      'EXTRAIR_DO_SITE',  // texto principal
  textSecondary:    'EXTRAIR_DO_SITE',  // texto secundário
  textMuted:        'EXTRAIR_DO_SITE',  // texto desativado/muted
  textOnAccent:     'EXTRAIR_DO_SITE',  // texto sobre fundo accent (provavelmente preto)

  // ── SEMÂNTICAS (manter standard) ─────────────────────────────────
  success:  '#22C55E',
  error:    '#EF4444',
  warning:  '#F59E0B',
  info:     '#3B82F6',
} as const;

// ─────────────────────────────────────────────────────────────────────
// FONTES — extrair do <head> do index.html ou do tailwind.config.js
// ─────────────────────────────────────────────────────────────────────
export const Fonts = {
  // Fonte para títulos (provavelmente serif elegante — Playfair, Cormorant, etc.)
  heading:        'EXTRAIR_DO_SITE',
  headingBold:    'EXTRAIR_DO_SITE',
  headingItalic:  'EXTRAIR_DO_SITE',

  // Fonte para corpo (provavelmente sans-serif — Inter, DM Sans, etc.)
  body:           'EXTRAIR_DO_SITE',
  bodySemiBold:   'EXTRAIR_DO_SITE',
  bodyBold:       'EXTRAIR_DO_SITE',
  caption:        'EXTRAIR_DO_SITE',
} as const;

// ─────────────────────────────────────────────────────────────────────
// ESPAÇAMENTO — manter consistente com o site
// ─────────────────────────────────────────────────────────────────────
export const Spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
  xxxl: 64,
} as const;

export const Radius = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  full: 9999,
} as const;

export const Layout = {
  screenPadding: 20,
  cardPadding:   16,
  inputHeight:   52,
  buttonHeight:  56,
  tabBarHeight:  83,
  headerHeight:  96,
} as const;

// ─────────────────────────────────────────────────────────────────────
// TIPOGRAFIA
// ─────────────────────────────────────────────────────────────────────
export const Typography = {
  hero:    { fontSize: 40, lineHeight: 48, letterSpacing: -1 },
  h1:      { fontSize: 32, lineHeight: 40, letterSpacing: -0.5 },
  h2:      { fontSize: 24, lineHeight: 32, letterSpacing: -0.3 },
  h3:      { fontSize: 20, lineHeight: 28, letterSpacing: -0.2 },
  body:    { fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  small:   { fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
  label:   { fontSize: 10, lineHeight: 14, letterSpacing: 2 },  // maiúsculas
} as const;
```

---

## ✍️ PASSO 3 — INSTALAÇÃO DE FONTES

Após extrair os nomes das fontes do site, instalar:

```bash
# Exemplo se o site usar Playfair Display + Inter:
npx expo install @expo-google-fonts/playfair-display
npx expo install @expo-google-fonts/inter

# Exemplo se usar Cormorant + DM Sans:
npx expo install @expo-google-fonts/cormorant
npx expo install @expo-google-fonts/dm-sans
```

Configurar em `app/_layout.tsx`:

```typescript
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Importar as fontes EXATAS usadas no site
  const [fontsLoaded] = useFonts({
    // Preencher com os valores extraídos do site
    'Heading-Bold': require('../assets/fonts/FONTE_HEADING.ttf'),
    'Body-Regular': require('../assets/fonts/FONTE_BODY.ttf'),
    'Body-SemiBold': require('../assets/fonts/FONTE_BODY_SEMIBOLD.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;
  return <Stack />;
}
```

---

## 🧩 PASSO 4 — COMPONENTES DE UI

### 4.1 — Botão Principal

```typescript
// components/ui/Button.tsx

import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors, Fonts, Radius, Layout, Typography } from '../../constants/tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  disabled?: boolean;
}

export function Button({ label, onPress, variant = 'primary', fullWidth, disabled }: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.4 : 1,
  }));

  // VARIANTE PRIMARY:
  // background: Colors.accent (cor extraída do site)
  // texto: Colors.textOnAccent (preto ou branco — verificar no site)
  // font: Fonts.bodyBold, 15px, letterSpacing: 1.5, UPPERCASE
  // height: Layout.buttonHeight (56px)
  // borderRadius: Radius.sm (4px — cantos ligeiramente arredondados, estilo premium)
  // Sem sombra no estado normal, sombra accent ao pressionar

  // VARIANTE OUTLINE:
  // background: transparente
  // border: 1px solid Colors.accent
  // texto: Colors.accent

  // VARIANTE GHOST:
  // background: transparente
  // sem border
  // texto: Colors.accent, sublinhado
}
```

### 4.2 — Header da App

```typescript
// components/navigation/AppHeader.tsx

// Replicar EXATAMENTE o header/navbar do site boldmens.co:
// - Logo "BOLDMENS" ou imagem do logo — mesma fonte e tamanho
// - Espaçamento idêntico ao site
// - Cor de fundo: Colors.background
// - Linha separadora inferior: 0.5px solid Colors.border
// - Badge de plano (FREE / PLUS) — canto direito
// - Altura: Layout.headerHeight (96px incluindo status bar)
```

### 4.3 — Card de Resultado de Análise

```typescript
// components/analysis/AnalysisCard.tsx

// Design inspirado nas secções/cards do site boldmens.co:
// - Fundo: Colors.backgroundCard
// - Border: 0.5px solid Colors.border
// - Border radius: Radius.lg (12px)
// - Padding: Layout.cardPadding (16px)

// ESTRUTURA DO CARD:
// ┌─────────────────────────────────────┐
// │ LABEL EM MAIÚSCULAS                 │  ← Colors.accent, caption font, letterSpacing: 2
// │ ─────────────────── (linha accent)  │  ← width: 32px, height: 1px, Colors.accent
// │ Título do Resultado                 │  ← Fonts.heading, h3, Colors.textPrimary
// │                                     │
// │ [tag1] [tag2] [tag3]               │  ← pills: bg backgroundMuted, texto textMuted
// └─────────────────────────────────────┘

// Animação de entrada:
// - FadeIn + translateY de +16px → 0
// - Duração: 300ms
// - Easing: easeOut
// - Delay escalonado: card1 = 0ms, card2 = 100ms, card3 = 200ms
```

### 4.4 — Bolha de Chat

```typescript
// components/chat/ChatBubble.tsx

// BOLHA DA IA (lado esquerdo):
// background: Colors.backgroundCard
// border: 0.5px solid Colors.border
// borderRadius: { topLeft: 2, topRight: Radius.lg, bottomLeft: Radius.lg, bottomRight: Radius.lg }
// padding: 12px 14px
// font: Fonts.body, 15px, Colors.textPrimary
// maxWidth: '82%'

// BOLHA DO USER (lado direito):
// background: Colors.accent
// borderRadius: { topLeft: Radius.lg, topRight: 2, bottomLeft: Radius.lg, bottomRight: Radius.lg }
// padding: 12px 14px
// font: Fonts.bodySemiBold, 15px, Colors.textOnAccent
// maxWidth: '75%'
// alinhamento: flex-end

// INDICADOR DE DIGITAÇÃO (IA a escrever):
// 3 círculos animados (bounce sequencial)
// cor: Colors.textMuted
// mesmo estilo de bolha da IA

// FOTO ENVIADA pelo user:
// thumbnail 200x200px, borderRadius: Radius.md
// overlay escuro com ícone no centro
// mesma posição que bolha do user
```

### 4.5 — Barra de Input

```typescript
// components/chat/ChatInputBar.tsx

// Container:
// background: Colors.background
// borderTop: 0.5px solid Colors.border
// padding: 12px 16px
// paddingBottom: 24px (safe area)

// Campo de texto:
// background: Colors.backgroundInput
// border: 0.5px solid Colors.border
// borderRadius: Radius.md
// height: Layout.inputHeight (52px)
// padding: 0 16px
// font: Fonts.body, 15px
// placeholderColor: Colors.textMuted
// texto: Colors.textPrimary

// Botão câmara (direita):
// background: Colors.accent
// width: 44px, height: 44px
// borderRadius: Radius.md
// ícone de câmara branco/escuro (verificar contraste com accent)

// CONTADOR DE PROMPTS (acima do input, apenas FREE):
// background: Colors.accentAlpha
// padding: 6px 16px
// font: Fonts.caption, Colors.accent
// texto: "X análises restantes hoje"
// borderTop: 0.5px solid Colors.accentAlpha
```

### 4.6 — Tab Bar

```typescript
// components/navigation/TabBar.tsx

// Replicar estilo de navegação do site (se tiver nav inferior):
// background: Colors.background
// borderTop: 0.5px solid Colors.border
// height: Layout.tabBarHeight (83px)
// 4 tabs: Chat / Histórico / Tendências / Perfil

// TAB INATIVA:
// ícone: Colors.textMuted
// label: Colors.textMuted, caption font

// TAB ATIVA:
// ícone: Colors.accent
// label: Colors.accent
// pequeno indicador ponto ou linha em Colors.accent

// SEM efeitos de sombra ou blur — estilo flat igual ao site
```

### 4.7 — Paywall / Upgrade Screen

```typescript
// app/paywall.tsx

// Ecrã full-screen modal (não tab):
// background: Colors.background

// HERO SECTION:
// Logo / ícone tesoura grande — Colors.accent
// Título: Fonts.heading, hero size, Colors.textPrimary
// Subtítulo: Fonts.body, Colors.textSecondary

// LINHA DECORATIVA:
// largura: 60px, altura: 1px, Colors.accent
// centralizada

// LISTA DE FEATURES:
// Para cada feature:
//   ícone check em círculo: background Colors.accentAlpha, border Colors.accent
//   texto: Fonts.body, Colors.textPrimary

// CARD DE PREÇO:
// background: Colors.backgroundCard
// border: 1px solid Colors.accent (destaque)
// borderRadius: Radius.lg
// padding: 20px
// preço: Fonts.heading, h2, Colors.accent
// período: Fonts.caption, Colors.textMuted
// trial: Fonts.bodySemiBold, Colors.accent

// BOTÃO CTA:
// Button variant="primary" fullWidth
// label: "COMEÇAR PLUS" ou "INICIAR 7 DIAS GRÁTIS"

// FOOTER:
// "Restaurar compra" — Colors.textMuted, ghost
// "Continuar grátis →" — Colors.textMuted, ghost
// Texto legal: Colors.textMuted, caption
```

---

## 📱 PASSO 5 — ECRÃS COMPLETOS

### 5.1 — Onboarding (3 slides)

```typescript
// app/(auth)/onboarding.tsx

// SLIDE 1 — "Descobre o teu corte ideal"
// SLIDE 2 — "IA que conhece as tendências"
// SLIDE 3 — "Começa grátis hoje"

// DESIGN DE CADA SLIDE:
// - Fundo: Colors.background
// - Ilustração/ícone grande: usar SVG inline, cores do site
// - Título: Fonts.heading, hero, Colors.textPrimary
//   (usar fonte de título exata do site — não usar outra)
// - Subtítulo: Fonts.body, Colors.textSecondary
// - Indicadores de progresso: Pills 6px altura
//   ativo: Colors.accent, inativo: Colors.border
// - Botão "Continuar": Button variant="primary"
// - Botão "Saltar" (slide 1 e 2): ghost, Colors.textMuted

// TRANSIÇÃO entre slides:
// react-native-reanimated — slide horizontal com fade
// Duração: 250ms, easing: easeInOut
```

### 5.2 — Ecrã de Câmara

```typescript
// app/analysis/camera.tsx

// OVERLAY sobre a câmara:
// - Topo: botão X (fechar) — branco semitransparente
// - Centro: oval guide de posicionamento do rosto
//   borda: 2px solid Colors.accent
//   interior: transparente
//   fora do oval: overlay escuro 60% opacidade
// - Instrução: "Posiciona o rosto no oval"
//   font: Fonts.bodyBold, branco, sombra de texto
// - Baixo: botão de captura circular
//   outer ring: 4px solid Colors.accent
//   inner circle: branco
//   diâmetro: 72px

// Após captura:
// - Preview da foto em fullscreen
// - Botão "Usar esta foto" — Button variant="primary"
// - Botão "Repetir" — Button variant="outline"
```

### 5.3 — Ecrã de Tendências

```typescript
// app/(tabs)/trends.tsx

// HEADER:
// Título: "Tendências" — Fonts.heading, h1, Colors.textPrimary
// Subtítulo: "Atualizado pela IA semanalmente" — caption, Colors.textMuted
// Linha accent decorativa

// LISTA (FlatList):
// Para utilizador FREE: mostrar 3 cards + lock nos restantes
// Para utilizador PLUS: mostrar todos sem lock

// CARD DE TENDÊNCIA:
// background: Colors.backgroundCard
// border: 0.5px solid Colors.border
// padding: 16px
// borderRadius: Radius.lg

// Header do card:
//   rank: "#1" — Colors.accent, caption, bold
//   badge "HOT" ou "NOVO": background Colors.accentAlpha, text Colors.accent, 6px
//   nome: Fonts.heading, h3, Colors.textPrimary
//   descrição: Fonts.body, Colors.textSecondary, 2 linhas

// Footer do card:
//   chips: tipo de cabelo ideal, nível de manutenção

// CARD LOCKED (FREE):
// Mesmo card mas com overlay:
//   background: rgba(Colors.background, 0.9)
//   ícone cadeado: Colors.accent
//   texto "Apenas PLUS": Colors.accent
//   botão "Ver com Plus": Button variant="outline" pequeno
```

### 5.4 — Ecrã de Perfil

```typescript
// app/(tabs)/profile.tsx

// AVATAR:
// Círculo 80px com inicial do nome
// background: Colors.accentAlpha
// border: 1px solid Colors.accent
// texto: Colors.accent, Fonts.heading, h2

// NOME e EMAIL:
// nome: Fonts.headingBold, h3, Colors.textPrimary
// email: Fonts.body, Colors.textMuted

// BADGE DE PLANO:
// FREE: background Colors.backgroundMuted, texto Colors.textMuted
// PLUS: background Colors.accentAlpha, texto Colors.accent, border Colors.accent

// SECÇÕES (lista de opções):
// Separador entre secções: linha 0.5px Colors.border + label secção em Colors.textMuted
// Cada item: padding 16px, borderBottom 0.5px Colors.border
// ícone esquerda: Colors.accent
// label: Fonts.body, Colors.textPrimary
// chevron direita: Colors.textMuted

// PLANO ATUAL (secção destacada):
// background: Colors.backgroundCard
// border: 0.5px solid Colors.border
// borderRadius: Radius.lg
// FREE → barra de progresso de prompts + botão Upgrade
// PLUS → data de renovação + botão Gerir
```

---

## 🔤 PASSO 6 — REGRAS TIPOGRÁFICAS

```
Regra 1: Títulos de ecrã → fonte de título do site (heading), weight bold
Regra 2: Labels/categorias em maiúsculas → caption font, letterSpacing: 2, Colors.accent
Regra 3: Corpo de texto → fonte de corpo do site (body), weight regular
Regra 4: Botões → fonte de corpo, weight bold, UPPERCASE, letterSpacing: 1.5
Regra 5: Preços → fonte de título ou mono, Colors.accent
Regra 6: Timestamps → caption font, Colors.textMuted
Regra 7: Placeholders → body font, Colors.textMuted
Regra 8: Error messages → body font, Colors.error
```

---

## ✨ PASSO 7 — ANIMAÇÕES E MICROINTERAÇÕES

```typescript
// Usar react-native-reanimated para TODAS as animações

// 1. ENTRADA DE CARDS (análise resultado):
// FadeIn + slideUp(16px) com spring — stagger 100ms entre cards

// 2. BOTÃO PRESS:
// scale: 1 → 0.96 (spring, damping 15)
// Ao soltar: 0.96 → 1 (spring, damping 20)

// 3. TAB SWITCH:
// ícone ativo: scale 1 → 1.1 → 1 (spring)
// cor: interpolação suave textMuted → accent

// 4. CHAT BUBBLE ENTRADA:
// IA: slideIn da esquerda + fadeIn, 200ms
// User: slideIn da direita + fadeIn, 150ms

// 5. STREAMING DE TEXTO (IA a escrever):
// Cada chunk de texto aparece com fadeIn rápido (50ms)

// 6. CÂMARA — captura:
// Flash branco fullscreen (100ms) ao tirar foto
// Transição suave para preview

// 7. PAYWALL:
// Modal sobe de baixo com spring
// Features entram em sequência com stagger 80ms
```

---

## 🖼️ PASSO 8 — ÍCONE DA APP E SPLASH SCREEN

### Ícone da App

```
Dimensões: 1024x1024px (exportar depois para todos os tamanhos)
Fundo: Colors.background (preto do site)
Elemento central: Tesoura ou logotipo da BoldMens
Cor do elemento: Colors.accent (dourado/accent do site)
Estilo: minimalista, flat — igual ao estilo do site
Sem gradientes, sem sombras, sem efeitos
```

### Splash Screen

```
background: Colors.background
Logo BoldMens centralizado: mesma cor e fonte do site
Animação: fade in suave do logo (500ms)
Configurar em app.json:
  "splash": {
    "backgroundColor": "EXTRAIR_COR_DO_SITE",
    "resizeMode": "contain"
  }
```

---

## 📋 PASSO 9 — CHECKLIST DE CONSISTÊNCIA

Antes de considerar o design concluído, verificar item a item:

**Cores:**
- [ ] Todas as cores são extraídas do tailwind.config.js do site
- [ ] Nenhuma cor foi inventada ou aproximada — são os valores HEX exatos
- [ ] O fundo principal é idêntico ao fundo do site
- [ ] A cor de destaque/accent é idêntica à do site
- [ ] Texto primário tem contraste mínimo 4.5:1 sobre o fundo

**Tipografia:**
- [ ] A fonte de título é a mesma do site (verificar no index.html)
- [ ] A fonte de corpo é a mesma do site
- [ ] Os pesos (bold, semibold, regular) são os mesmos
- [ ] Letter-spacing dos títulos replica o do site

**Componentes:**
- [ ] Botões têm o mesmo border-radius que os do site
- [ ] Cards têm o mesmo espaçamento interno
- [ ] Bordas têm a mesma espessura e cor
- [ ] Sombras (ou ausência delas) replicam o site

**Identidade:**
- [ ] O logo usa exatamente a mesma fonte do site
- [ ] O ícone da app é consistente com a identidade visual
- [ ] A splash screen usa as cores exatas do site

---

## ⚙️ CONFIGURAÇÃO NativeWind

```javascript
// tailwind.config.js da app — preencher com valores do site

module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // COPIAR EXATAMENTE do tailwind.config.js do site boldmens-salon
        background:    'EXTRAIR_DO_SITE',
        card:          'EXTRAIR_DO_SITE',
        accent:        'EXTRAIR_DO_SITE',
        'accent-light':'EXTRAIR_DO_SITE',
        border:        'EXTRAIR_DO_SITE',
        'text-primary':'EXTRAIR_DO_SITE',
        'text-muted':  'EXTRAIR_DO_SITE',
      },
      fontFamily: {
        // COPIAR EXATAMENTE do site
        heading: ['EXTRAIR_DO_SITE'],
        body:    ['EXTRAIR_DO_SITE'],
      },
      borderRadius: {
        // Verificar se o site usa cantos específicos
        sm:  '4px',
        md:  '8px',
        lg:  '12px',
      },
    },
  },
  plugins: [],
};
```

---

## 📌 NOTAS CRÍTICAS PARA O CODEX

1. **Prioridade máxima**: Ler o `tailwind.config.js` do repo `boldmens-salon` ANTES de escrever qualquer linha de código de UI.

2. **Não inventar**: Se uma cor ou fonte não estiver explícita no config, inspecionar os componentes React mais usados (Header, Hero, Button) para identificar as classes Tailwind e mapear para os valores reais.

3. **Testar em iPhone 15 Pro**: Dimensões 393×852pt. Todos os touch targets mínimo 44×44pt.

4. **Dark mode nativo**: A app deve usar `useColorScheme()` do React Native e honrar a preferência do sistema — mas como o site é dark, o dark mode é o modo principal.

5. **Performance**: Usar `React.memo()` nos componentes de card para evitar re-renders desnecessários durante o streaming de texto.

6. **Acessibilidade**: Todos os botões com `accessibilityLabel`. Ícones com `accessibilityRole="image"`.

7. **Safe Areas**: Sempre usar `useSafeAreaInsets()` — especialmente no input bar (home indicator do iPhone).

---

*BoldMens AI iOS — Design System | by spwebfamily-crypto | boldmens.co*
