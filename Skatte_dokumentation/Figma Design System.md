# Figma Design System - Data Extraction Template

**Instruktion til Claude Code:**
GennemgÃ¥ hele kodebasen og udfyld ALLE felter i dette dokument med de faktiske vÃ¦rdier fra koden. Dette dokument bruges til at bygge et Figma Design System.

---

# 1. FOUNDATIONS

## 1.1 Color Palette

### Brand Colors
| Name | Tailwind Class | HEX | RGB | Opacity Variants | Usage |
|------|----------------|-----|-----|------------------|-------|
| Primary | | | | | |
| Secondary | | | | | |
| Accent | | | | | |

### Risk Scale Colors
| Level | Name (DA) | Name (EN) | Tailwind Class | HEX | RGB | Usage |
|-------|-----------|-----------|----------------|-----|-----|-------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |

### Semantic Colors
| Purpose | Tailwind Class | HEX | RGB | Usage |
|---------|----------------|-----|-----|-------|
| Success/Positive | | | | |
| Warning | | | | |
| Error/Negative | | | | |
| Info | | | | |
| Neutral | | | | |

### Background Colors
| Element | Tailwind Class | HEX | RGB | Opacity |
|---------|----------------|-----|-----|---------|
| Page background | | | | |
| Card background | | | | |
| Modal background | | | | |
| Input background | | | | |
| Sidebar background | | | | |
| Header background | | | | |
| Hover state | | | | |

### Border Colors
| Element | Tailwind Class | HEX | RGB | Opacity |
|---------|----------------|-----|-----|---------|
| Default border | | | | |
| Risk border (template) | | | | |
| Neutral border | | | | |
| Input border | | | | |
| Input focus border | | | | |
| Divider | | | | |

### Text Colors
| Purpose | Tailwind Class | HEX | RGB |
|---------|----------------|-----|-----|
| Primary text | | | |
| Secondary text | | | |
| Tertiary text | | | |
| Muted text | | | |
| Placeholder text | | | |
| Link text | | | |
| Link hover | | | |

### Gradient Definitions
| Name | Direction | Tailwind Classes | CSS Gradient | Usage |
|------|-----------|------------------|--------------|-------|
| Risk card gradient | | | | |
| Neutral card gradient | | | | |
| CTA button gradient | | | | |
| Risk scale bar gradient | | | | |

---

## 1.2 Typography

### Font Family
| Purpose | Font Name | Tailwind Class | Fallback Stack |
|---------|-----------|----------------|----------------|
| Primary | | | |
| Monospace (numbers) | | | |

### Type Scale
| Name | Size (px) | Size (rem) | Tailwind Class | Line Height | Letter Spacing |
|------|-----------|------------|----------------|-------------|----------------|
| Display | | | | | |
| H1 | | | | | |
| H2 | | | | | |
| H3 | | | | | |
| H4 | | | | | |
| Body Large | | | | | |
| Body | | | | | |
| Body Small | | | | | |
| Caption | | | | | |
| Overline | | | | | |

### Font Weights
| Name | Weight | Tailwind Class | Usage |
|------|--------|----------------|-------|
| Regular | | | |
| Medium | | | |
| Semibold | | | |
| Bold | | | |

### Text Styles (Combined)
| Style Name | Size | Weight | Color | Line Height | Extra | Usage |
|------------|------|--------|-------|-------------|-------|-------|
| Page title | | | | | | |
| Section header | | | | | | |
| Card title | | | | | | |
| Card value (large) | | | | | | |
| Card value (medium) | | | | | | |
| Card value (small) | | | | | | |
| Label | | | | | | |
| Label uppercase | | | | | | |
| Body text | | | | | | |
| Helper text | | | | | | |
| Button text | | | | | | |
| Input text | | | | | | |
| Input placeholder | | | | | | |
| Table header | | | | | | |
| Table cell | | | | | | |

---

## 1.3 Spacing

### Spacing Scale
| Token | Pixels | Tailwind Class | Usage Examples |
|-------|--------|----------------|----------------|
| 4xs | | | |
| 3xs | | | |
| 2xs | | | |
| xs | | | |
| sm | | | |
| md | | | |
| lg | | | |
| xl | | | |
| 2xl | | | |
| 3xl | | | |
| 4xl | | | |

### Component-Specific Spacing
| Component | Padding | Gap | Margin | Tailwind Classes |
|-----------|---------|-----|--------|------------------|
| Card | | | | |
| Modal | | | | |
| Button | | | | |
| Input | | | | |
| Section | | | | |
| Header | | | | |
| Sidebar | | | | |
| Table cell | | | | |
| Badge | | | | |
| Icon container | | | | |

---

## 1.4 Border Radius

| Token | Pixels | Tailwind Class | Usage |
|-------|--------|----------------|-------|
| None | | | |
| Small | | | |
| Medium | | | |
| Large | | | |
| XL | | | |
| 2XL | | | |
| Full (circle) | | | |

### Component Border Radius
| Component | Radius | Tailwind Class |
|-----------|--------|----------------|
| Card | | |
| Modal | | |
| Button | | |
| Input | | |
| Badge | | |
| Icon container | | |
| Dropdown | | |
| Tooltip | | |

---

## 1.5 Shadows

| Token | Tailwind Class | CSS Box Shadow | Usage |
|-------|----------------|----------------|-------|
| None | | | |
| Small | | | |
| Medium | | | |
| Large | | | |
| XL | | | |
| 2XL | | | |

### Component Shadows
| Component | Shadow | Tailwind Class |
|-----------|--------|----------------|
| Card | | |
| Modal | | |
| Dropdown | | |
| Tooltip | | |

---

## 1.6 Breakpoints

| Name | Min Width | Max Width | Tailwind Prefix |
|------|-----------|-----------|-----------------|
| Mobile | | | |
| Tablet | | | |
| Desktop | | | |
| Large Desktop | | | |

---

## 1.7 Z-Index Scale

| Layer | Z-Index | Tailwind Class | Usage |
|-------|---------|----------------|-------|
| Base | | | |
| Dropdown | | | |
| Sticky | | | |
| Modal backdrop | | | |
| Modal | | | |
| Tooltip | | | |
| Toast | | | |

---

# 2. COMPONENTS

## 2.1 Buttons

### Primary Button (Gradient)
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Background Hover | | |
| Text color | | |
| Font size | | |
| Font weight | | |
| Padding | | |
| Border radius | | |
| Min height | | |
| Transition | | |
| Disabled state | | |

### Secondary Button
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Background Hover | | |
| Text color | | |
| Font size | | |
| Font weight | | |
| Padding | | |
| Border radius | | |

### Danger Button
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Background Hover | | |
| Text color | | |
| Font size | | |
| Font weight | | |
| Padding | | |
| Border radius | | |

### Ghost Button
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Background Hover | | |
| Text color | | |
| Text Hover | | |
| Padding | | |
| Border radius | | |

### Icon Button
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Size | | |
| Background | | |
| Background Hover | | |
| Icon color | | |
| Border radius | | |
| Padding | | |

### Button Sizes (if applicable)
| Size | Padding | Font Size | Min Height |
|------|---------|-----------|------------|
| Small | | | |
| Medium | | | |
| Large | | | |

---

## 2.2 Inputs

### Text Input
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Border | | |
| Border Radius | | |
| Padding | | |
| Text color | | |
| Placeholder color | | |
| Font size | | |
| Focus border | | |
| Focus ring | | |
| Disabled state | | |
| Error state | | |

### Input with Icon
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Icon position | | |
| Icon color | | |
| Icon size | | |
| Padding left (with icon) | | |

### Dropdown/Select
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Same as text input | | |
| Dropdown background | | |
| Dropdown border | | |
| Option hover | | |
| Option selected | | |

### Checkbox
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Size | | |
| Border | | |
| Border radius | | |
| Checked background | | |
| Checkmark color | | |

### Toggle/Switch
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Track width | | |
| Track height | | |
| Track off color | | |
| Track on color | | |
| Thumb size | | |
| Thumb color | | |

---

## 2.3 Cards

### Risk Card (with color)
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Border | | |
| Border radius | | |
| Padding | | |
| Gradient | | |
| Gradient direction | | |
| Min height (if any) | | |
| Hover state | | |

### Neutral Card (violet)
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Border | | |
| Border radius | | |
| Padding | | |
| Gradient | | |
| Gradient direction | | |

### Card Header
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Icon container background | | |
| Icon container size | | |
| Icon container radius | | |
| Icon size | | |
| Title font | | |
| Description font | | |
| Gap between icon and text | | |

### Card Value Display
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Large value font | | |
| Medium value font | | |
| Small value font | | |
| Value color (risk) | | |
| Value color (positive) | | |
| Value color (negative) | | |
| Value color (neutral) | | |

---

## 2.4 Modals

### Modal Overlay
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Backdrop blur | | |
| Z-index | | |

### Modal Container
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Border | | |
| Border radius | | |
| Padding | | |
| Shadow | | |
| Max width (small) | | |
| Max width (medium) | | |
| Max width (large) | | |
| Max height | | |

### Modal Header
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Title font | | |
| Close button style | | |
| Bottom border (if any) | | |
| Padding | | |

### Modal Footer
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Top border (if any) | | |
| Padding | | |
| Button alignment | | |
| Button gap | | |

---

## 2.5 Badges

### Risk Level Badge (Dots)
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Dot size | | |
| Dot gap | | |
| Active dot color | | |
| Inactive dot color | | |
| Total dots | | |

### Text Badge
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Text color | | |
| Font size | | |
| Font weight | | |
| Padding | | |
| Border radius | | |

### Status Badge Variants
| Status | Background | Text Color | Border |
|--------|------------|------------|--------|
| Success | | | |
| Warning | | | |
| Error | | | |
| Info | | | |
| Neutral | | | |

---

## 2.6 Icons

### Icon Sizes
| Size Name | Pixels | Tailwind Class |
|-----------|--------|----------------|
| XS | | |
| SM | | |
| MD | | |
| LG | | |
| XL | | |

### Icon Container (Risk)
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Size | | |
| Border radius | | |
| Padding | | |
| Icon color | | |

### Icon Container (Neutral)
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Size | | |
| Border radius | | |
| Padding | | |
| Icon color | | |

### Icons Used in App
| Icon Name | Library | Usage Location |
|-----------|---------|----------------|
| | | |
| | | |
| | | |
(List all icons used)

---

## 2.7 Tables

### Table Container
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Border | | |
| Border radius | | |
| Overflow | | |

### Table Header
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Text color | | |
| Font size | | |
| Font weight | | |
| Padding | | |
| Border bottom | | |

### Table Row
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Background hover | | |
| Border bottom | | |
| Padding | | |

### Table Cell
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Text color | | |
| Font size | | |
| Padding | | |
| Alignment (default) | | |
| Alignment (numbers) | | |

---

## 2.8 Navigation

### Header
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Height | | |
| Padding | | |
| Border bottom | | |
| Position | | |
| Z-index | | |

### Header Nav Item
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Text color | | |
| Text color hover | | |
| Text color active | | |
| Background active | | |
| Font size | | |
| Font weight | | |
| Padding | | |
| Border radius | | |

### Sidebar
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Width | | |
| Background | | |
| Border right | | |
| Padding | | |

### Sidebar Item
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Text color | | |
| Text color hover | | |
| Text color active | | |
| Background hover | | |
| Background active | | |
| Padding | | |
| Border radius | | |
| Gap (icon to text) | | |

---

## 2.9 Tooltips

| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Text color | | |
| Font size | | |
| Padding | | |
| Border radius | | |
| Shadow | | |
| Max width | | |
| Arrow size | | |

---

## 2.10 Dropdowns

| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Border | | |
| Border radius | | |
| Shadow | | |
| Padding | | |
| Min width | | |

### Dropdown Item
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Text color | | |
| Background hover | | |
| Padding | | |
| Font size | | |

---

## 2.11 Progress/Bars

### Progress Bar (Heatmap/Chart)
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Track background | | |
| Track height | | |
| Track border radius | | |
| Fill positive color | | |
| Fill negative color | | |
| Fill border radius | | |

---

## 2.12 Heatmap Cells

| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background (positive) | | |
| Background (negative) | | |
| Text color | | |
| Font size | | |
| Font weight | | |
| Padding | | |
| Border radius | | |

---

# 3. PATTERNS (Composite Components)

## 3.1 VaR Display Section

### Container
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Grid columns (mobile) | | |
| Grid columns (desktop) | | |
| Gap | | |

### VaR Card (individual)
| Property | Value | Notes |
|----------|-------|-------|
| Uses Risk Card style | | |
| Highlight ring (weekly) | | |

---

## 3.2 Metric Cards Grid (8 cards)

| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Grid columns (mobile) | | |
| Grid columns (tablet) | | |
| Grid columns (desktop) | | |
| Gap | | |

---

## 3.3 Position Table Row

| Property | Value | Notes |
|----------|-------|-------|
| Card style | | |
| Columns | | |
| Responsive behavior | | |

---

## 3.4 Largest Movements (2 cards)

### Container
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Grid columns (mobile) | | |
| Grid columns (desktop) | | |
| Gap | | |

### Gainers Card
| Property | Value | Notes |
|----------|-------|-------|
| Border color | | emerald |
| Gradient color | | emerald |

### Losers Card
| Property | Value | Notes |
|----------|-------|-------|
| Border color | | rose |
| Gradient color | | rose |

---

## 3.5 Performance Heatmap

### Container
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Background | | |
| Border | | |
| Border radius | | |
| Padding | | |

### Header Row
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Font | | |
| Color | | |

### Data Row
| Property | Value | Notes |
|----------|-------|-------|
| Name column | | font-bold for "Samlet PortefÃ¸lje" |
| Progress bar | | |
| Percentage cells | | |

---

# 4. PAGE LAYOUTS

## 4.1 Main App Layout

| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Header height | | |
| Sidebar width | | |
| Content max width | | |
| Content padding | | |
| Page background | | |

### Layout Structure
```
Describe the layout structure:
- Header position and behavior
- Sidebar position and behavior  
- Content area
- Responsive changes
```

---

## 4.2 Dashboard / Overview Page

### Section Order
1. 
2. 
3. 
4. 
(List all sections in order)

### Section Spacing
| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Between sections | | |
| Section title margin | | |

---

## 4.3 Risk Analysis Page

### Section Order
1. 
2. 
3. 
4. 
(List all sections in order)

---

## 4.4 Login/Signup Pages

| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Card max width | | |
| Card padding | | |
| Form gap | | |
| Logo size | | |

---

## 4.5 Landing Page

### Sections
1. Hero
2. Features
3. How it works
4. Pricing
5. FAQ
6. CTA

(Document each section's layout)

---

# 5. ANIMATIONS & TRANSITIONS

## 5.1 Transition Defaults

| Property | Value | Tailwind Classes |
|----------|-------|------------------|
| Duration (fast) | | |
| Duration (normal) | | |
| Duration (slow) | | |
| Easing | | |

## 5.2 Component Transitions

| Component | Properties Transitioned | Duration |
|-----------|------------------------|----------|
| Button hover | | |
| Card hover | | |
| Input focus | | |
| Modal open/close | | |
| Dropdown open/close | | |

---

# 6. STATES

## 6.1 Interactive States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | | |
| Hover | | |
| Active/Pressed | | |
| Focus | | |
| Disabled | | |
| Loading | | |
| Error | | |
| Success | | |

---

# 7. FIGMA IMPLEMENTATION NOTES

## 7.1 Color Styles to Create
(List all color styles needed in Figma)

## 7.2 Text Styles to Create
(List all text styles needed in Figma)

## 7.3 Effect Styles to Create
(List shadows, blurs, etc.)

## 7.4 Components to Create
(List all components with variants)

## 7.5 Auto Layout Settings
(Document common auto layout patterns)

---

# 8. ADDITIONAL NOTES

(Any other observations or patterns found in the codebase)
