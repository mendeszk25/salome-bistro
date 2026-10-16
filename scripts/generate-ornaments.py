from pathlib import Path
import math
D=Path(__file__).resolve().parents[1] / 'assets' / 'ornamentos'
D.mkdir(parents=True,exist_ok=True)
GOLD='#EFC68B'; AMBER='#DDA660'; ORANGE='#DF7543'; BURG='#4B1830'; LIGHT='#FFF0D0'; INK='#67213A'

def header(w,h,title,body,extra=''):
 return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" fill="none" role="presentation" aria-hidden="true"><title>{title}</title>{extra}{body}</svg>'''
def tag(n,content):
 (D/f'{n}.svg').write_text(content,encoding='utf-8')
def line(x1,y1,x2,y2,stroke=GOLD,width=1,op=1):
 return f'<path d="M{x1:.2f} {y1:.2f}L{x2:.2f} {y2:.2f}" stroke="{stroke}" stroke-width="{width}" opacity="{op}"/>'
def circle(cx,cy,r,stroke=GOLD,sw=1,fill='none',opacity=1):
 return f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" stroke="{stroke}" stroke-width="{sw}" fill="{fill}" opacity="{opacity}"/>'
def diamond(x,y,rad,stroke=GOLD,sw=1,fill='none'):
 return f'<path d="M{x:.2f} {y-rad:.2f}L{x+rad:.2f} {y:.2f}L{x:.2f} {y+rad:.2f}L{x-rad:.2f} {y:.2f}Z" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'

# 1. Architectural Art Déco corner with stepped bronze fillet, faceted rosette and fan.
s=[]
for off,op,sw in [(9,1,2.3),(17,.72,1.35),(27,.48,1)]:
 s.append(f'<path d="M{off} 166V{60+off/3:.1f}Q{off} {off+10} {off+13} {off}H166" stroke="{GOLD}" stroke-width="{sw}" opacity="{op}" stroke-linecap="round"/>')
for i in range(3):
 y=47+i*7; s.append(line(76+i*3,y,150-i*7,y,GOLD,1,.75-i*.16))
 x=47+i*7; s.append(line(x,76+i*3,x,150-i*7,GOLD,1,.75-i*.16))
s.append(f'<path d="M22 65A43 43 0 0 0 65 22L65 65Z" fill="{BURG}" fill-opacity=".8" stroke="{GOLD}" stroke-width="1.4"/>')
for i in range(11):
 a=math.pi + i*(math.pi/2)/10 # from 180 to 270
 cx,cy=65,65
 x= cx+40*math.cos(a); y=cy+40*math.sin(a)
 s.append(line(cx,cy,x,y,GOLD,.9,.8))
s.append(f'<path d="M10 18L18 10L26 18L18 26Z" fill="{ORANGE}" stroke="{GOLD}" stroke-width="1.4"/>')
s.append(diamond(18,18,4,BURG,.8,GOLD))
s.append(diamond(9,170,6,GOLD,1.2,ORANGE))
s.append(diamond(171,9,5,GOLD,1,ORANGE))
for x,y in [(37,11),(53,11),(11,37),(11,53),(65,12),(12,65),(87,23),(23,87),(152,27),(27,152)]: s.append(circle(x,y,1.5,ORANGE,.6,ORANGE))
s.append('<path d="M9 180V195M180 9H195" stroke="#DFA66A" stroke-width="1.3"/>')
tag('cantoneira-deco',header(200,200,'Cantoneira Art Déco — Salomé', ''.join(s)))

# 2. Ornamental divider, never a thick dominant line.
s=[]
for y,sw,opacity in [(44,1.5,.92),(53,0.75,.52)]:
 s += [line(6,y,188,y,GOLD,sw,opacity),line(332,y,514,y,GOLD,sw,opacity)]
for x,sign in [(176,1),(344,-1)]:
 s.append(f'<path d="M{x-30} 44Q{x} 21 {x+18} 44Q{x+32} 58 {x+40} 44" stroke="{GOLD}" stroke-width="1" opacity=".72"/>')
s += [diamond(260,44,21,GOLD,1.7,BURG),diamond(260,44,14,ORANGE,1.1,ORANGE),diamond(260,44,6,GOLD,1.4,BURG)]
for i in range(24):
 a=math.tau*i/24; r1=27 if i%2 else 31;r2=38 if i%2 else 43
 s.append(line(260+math.cos(a)*r1,44+math.sin(a)*r1,260+math.cos(a)*r2,44+math.sin(a)*r2,ORANGE if i%3==0 else GOLD,.95,.86))
for x in [13,29,57,103,152,368,417,463,491,507]: s.append(circle(x,44,1.3,ORANGE,.4,ORANGE))
for x in [230,290]:
 for dy in [-13,13]: s.append(diamond(x,44+dy,3.8,ORANGE,.9))
tag('filete-deco',header(520,90,'Filete ornamental Art Déco com rosa dos ventos', ''.join(s)))

# 3. Detailed seal: background ring only so real HTML copy stays readable.
s=[]
for r,sw,op in [(92,1.9,1),(86,.85,.78),(79,1.1,.88),(63,.65,.65)]:s.append(circle(100,100,r,LIGHT,sw,'none',op))
for i in range(72):
 a=math.tau*i/72
 x=100+83*math.cos(a);y=100+83*math.sin(a)
 s.append(circle(x,y,.8,LIGHT,.1,LIGHT,.84))
for i in range(8):
 a=math.tau*i/8; x=100+91*math.cos(a);y=100+91*math.sin(a)
 s.append(diamond(x,y,2.5,LIGHT,.6,ORANGE if i%2==0 else GOLD))
for i in range(12):
 a=math.tau*i/12
 r1,r2=66,73
 s.append(line(100+math.cos(a)*r1,100+math.sin(a)*r1,100+math.cos(a)*r2,100+math.sin(a)*r2,LIGHT,.85,.64))
for y in [33,167]: s.append(diamond(100,y,6,LIGHT,1.1,'none'))
for x in [33,167]: s.append(circle(x,100,2,LIGHT,.7,LIGHT,.9))
tag('selo-anel-deco',header(200,200,'Selo circular ornamental Comida Encontros Histórias', ''.join(s)))

# 4. Botanical pineapple etching; clipped crosshatching for dimensional peel.
extra='''<defs><clipPath id="pineapple-body"><path d="M91 193C87 163 109 146 160 145C207 146 230 169 227 203L219 308Q209 360 160 385Q109 359 102 308Z"/></clipPath></defs>'''
s=[]
# leaf crown
leafs=[(-67,-18,82),(-51,-56,110),(-35,-69,135),(-19,-91,148),(0,-111,163),(22,-95,140),(40,-77,137),(59,-47,108),(78,-19,89)]
for dx,dy,L in leafs:
 tipx=160+dx;tipy=145-L
 s.append(f'<path d="M160 169Q{155+dx*.2:.2f} {104+dy*.23:.2f} {tipx:.2f} {tipy:.2f}Q{153+dx*.35:.2f} {103+dy*.12:.2f} 160 169Z" stroke="{GOLD}" stroke-width="1.45" fill="{GOLD}" fill-opacity=".028"/>')
 s.append(f'<path d="M160 159Q{157+dx*.3:.2f} {113+dy*.18:.2f} {tipx:.2f} {tipy:.2f}" stroke="{ORANGE}" stroke-width=".67" opacity=".73"/>')
# body
s.append(f'<path d="M91 193C87 163 109 146 160 145C207 146 230 169 227 203L219 308Q209 360 160 385Q109 359 102 308Z" stroke="{GOLD}" stroke-width="2.1" fill="{GOLD}" fill-opacity=".04"/>')
# lattice clipped
s.append('<g clip-path="url(#pineapple-body)">')
for b in range(-380,550,19):
 s.append(f'<path d="M{b} 130L{b+230} 412" stroke="{ORANGE}" stroke-width="1.0" opacity=".75"/>')
 s.append(f'<path d="M{b} 412L{b+230} 130" stroke="{GOLD}" stroke-width="1.0" opacity=".62"/>')
for row in range(7):
 for col in range(5):
  x=108+col*25+(row%2)*13; y=185+row*26
  s.append(f'<path d="M{x-6} {y}q6 -8 12 0q-6 9 -12 0" stroke="{GOLD}" stroke-width=".7" opacity=".5"/>')
s.append('</g>')
# botanical side flourishes and dots
for side in [-1,1]:
 s.append(f'<path d="M{160+side*78} 351Q{160+side*124} 335 {160+side*138} 282" stroke="{ORANGE}" stroke-width="1.2"/>')
 for j in range(3):
  x=160+side*(101+j*9);y=324-j*18
  s.append(f'<path d="M{x} {y}q{side*28} -20 {side*17} -34q{-side*23} 8 {-side*17} 34Z" fill="{ORANGE}" fill-opacity=".09" stroke="{GOLD}" stroke-width="1"/>')
for y in [166,202,249,295,341]:
 for x in [42,278]: s.append(diamond(x,y,3.0,ORANGE,0.9))
s.append(circle(160,399,4.1,GOLD,.9,ORANGE))
tag('gravura-abacaxi',header(320,430,'Gravura detalhada de abacaxi com hachuras botânicas',''.join(s),extra))

# 5. Orange with peels, wedge segments and leaves.
s=[]
# outer fruit sphere left
s.append(f'<circle cx="112" cy="152" r="70" stroke="{GOLD}" stroke-width="1.8" fill="{GOLD}" fill-opacity=".045"/>')
s.append(circle(112,152,64,ORANGE,.6))
# peel detail dots
for i in range(250):
 a=(i*2.399963229728653)%math.tau; r=math.sqrt((i+.5)/250)*59
 x=112+math.cos(a)*r;y=152+math.sin(a)*r
 if x>149 and y>142:continue
 s.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r=".63" fill="{GOLD}" opacity=".43"/>')
# wedge on right
s.append(f'<path d="M158 154L254 190A104 104 0 0 1 137 261Z" fill="{ORANGE}" fill-opacity=".06" stroke="{GOLD}" stroke-width="2"/>')
s.append(f'<path d="M164 164L243 195A91 91 0 0 1 143 249Z" stroke="{ORANGE}" stroke-width=".8"/>')
for i in range(8):
 a=math.radians(20+i*10)
 ex=164+80*math.cos(a);ey=164+80*math.sin(a)
 s.append(line(164,164,ex,ey,GOLD,.8,.72))
# stem + leaves
s.append(f'<path d="M105 88Q101 63 116 38" stroke="{GOLD}" stroke-width="1.65"/>')
for x,y,xx,yy in [(112,54,28,17),(119,57,201,23),(99,79,31,61)]:
 s.append(f'<path d="M{x} {y}Q{(x+xx)/2:.1f} {yy-23:.1f} {xx} {yy}Q{(x+xx)/2:.1f} {yy+15:.1f} {x} {y}Z" stroke="{GOLD}" stroke-width="1.4" fill="{ORANGE}" fill-opacity=".09"/>')
 s.append(line(x,y,xx,yy,ORANGE,.75,.8))
 for j in range(1,6):
  t=j/6; bx=x+(xx-x)*t;by=y+(yy-y)*t
  s.append(line(bx,by,bx+(yy-y)/14,by-(xx-x)/14,GOLD,.5,.55))
# blossom
for i in range(5):
 a=math.tau*i/5;x=145+16*math.cos(a);y=76+16*math.sin(a)
 s.append(f'<ellipse cx="{x:.2f}" cy="{y:.2f}" rx="11" ry="5" transform="rotate({math.degrees(a):.2f} {x:.2f} {y:.2f})" stroke="{GOLD}" stroke-width=".8" fill="{GOLD}" fill-opacity=".07"/>')
s.append(circle(145,76,5.2,ORANGE,.9,ORANGE))
for x,y in [(20,90),(273,80),(277,216),(47,261)]:s.append(diamond(x,y,4,ORANGE,1))
for r in [99,107]:s.append(f'<path d="M{9} 176A{r} {r} 0 0 1 120 {152-r}" stroke="{ORANGE}" stroke-width=".65" opacity=".6"/>')
tag('gravura-citrico',header(295,285,'Gravura de laranja, casca, gomo e flor', ''.join(s)))

# 6. Accordion with precise bellows and engraved keyboard cabinets, rays and scrollwork.
s=[]
# rays ornamental fan
for side in [-1,1]:
 x=130+side*106
 for i in range(9):
  angle=(i-4)*.17
  x1=x+side*9; y1=108
  x2=x+side*(29+abs(i-4)*3); y2=108+math.sin(angle)*68
  s.append(line(x1,y1,x2,y2,GOLD,.9,.64))
  s.append(circle(x2,y2,1.7,ORANGE,.5,ORANGE))
# outer housings
s.append(f'<path d="M15 56L65 41L73 176L24 188Z" fill="{BURG}" fill-opacity=".58" stroke="{GOLD}" stroke-width="2"/>')
s.append(f'<path d="M195 41L245 56L236 188L187 176Z" fill="{BURG}" fill-opacity=".58" stroke="{GOLD}" stroke-width="2"/>')
s.append(f'<path d="M23 62L59 51L66 167L30 178ZM201 51L237 62L230 178L194 167Z" stroke="{ORANGE}" stroke-width="1.3"/>')
# ornament case corners
for x,y in [(29,71),(58,61),(34,168),(228,71),(201,61),(223,168)]:s.append(diamond(x,y,3.5,GOLD,.8,ORANGE))
# bellows zig-zag top bottom and thin folds
n=15;x0=73;x1=187
pTop=[];pBottom=[]
for i in range(n+1):
 x=x0+(x1-x0)*i/n; pTop.append((x,50 if i%2 else 40));pBottom.append((x,175 if i%2 else 184))
s.append(f'<path d="M{"L".join(f"{x:.2f} {y:.2f}" for x,y in pTop)}L{"L".join(f"{x:.2f} {y:.2f}" for x,y in reversed(pBottom))}Z" fill="{ORANGE}" fill-opacity=".07" stroke="{GOLD}" stroke-width="1.5"/>')
for i in range(n+1):
 x=x0+(x1-x0)*i/n;top=50 if i%2 else 40;bot=175 if i%2 else 184
 s.append(line(x,top,x,bot,GOLD,.9,.73))
 if i%2==0:s.append(line(x+2,51,x+2,171,ORANGE,.6,.4))
for x in [42,49,56]:
 for y in [92,106,120,134,148]:s.append(circle(x,y,2.0,GOLD,.7,GOLD,.75))
for x in [205,213,221,229]: s.append(f'<path d="M{x} 92v65" stroke="{GOLD}" stroke-width="2.4"/>')
for y in [86,165]:s.append(line(25,y,63,y,ORANGE,.6,.5))
s.append(diamond(130,30,6,ORANGE,1.1));s.append(diamond(130,192,6,ORANGE,1.1))
tag('sanfona-linear',header(260,220,'Sanfona nordestina em gravura detalhada',''.join(s)))

# 7. Rhythm and pandeiro: flowing triple ribbons, rhythm marks, stars, circles.
s=[]
for i,(offset,op) in enumerate([(0,.91),(11,.70),(22,.41)]):
 s.append(f'<path d="M12 {171+offset}C95 {102+offset} 139 {217+offset} 218 {145+offset}S347 {74+offset} 439 {139+offset}" stroke="{GOLD if i!=1 else ORANGE}" stroke-width="{2 if i==0 else 1.1}" opacity="{op}"/>')
# tambourine right circular tilted
s.append(f'<g transform="rotate(-13 331 135)"><circle cx="331" cy="135" r="64" stroke="{GOLD}" stroke-width="2.4"/><circle cx="331" cy="135" r="54" stroke="{ORANGE}" stroke-width="1.1"/>' )
for i in range(10):
 a=i*math.tau/10;x=331+62*math.cos(a);y=135+62*math.sin(a)
 s.append(circle(x,y,5.2,GOLD,1.1,'none',.8))
s.append('</g>')
for i,h in enumerate([35,64,81,56,108,44,74,92,55]):
 x=155+i*9
 s.append(line(x,129,x,129-h,INK,1.4,.78))
# notes
for x,y in [(122,74),(179,60)]:
 s.append(f'<ellipse cx="{x}" cy="{y}" rx="7" ry="4" fill="{INK}" transform="rotate(-17 {x} {y})"/><path d="M{x+6} {y}v-34" stroke="{INK}" stroke-width="1.8"/>')
for x,y in [(72,42),(265,32),(434,40)]:
 s.append(diamond(x,y,8,GOLD,1.3));s.append(diamond(x,y,3,ORANGE,.8,ORANGE))
for x,y in [(35,103),(95,205),(264,210),(430,199)]:s.append(circle(x,y,2.2,ORANGE,.4,ORANGE))
tag('ritmo-poster',header(460,230,'Partitura de encontro e pandeiro em traço Art Déco',''.join(s)))

# 8. poster corners in bordeaux on yellow poster.
s=[]
for off,op in [(8,1),(17,.64),(26,.34)]:
 s.append(f'<path d="M{off} 105V{off+22}Q{off} {off} {off+20} {off}H105" stroke="{BURG}" stroke-width="1.6" opacity="{op}"/>')
for i in range(8):
 a=math.pi+i*math.pi/2/7
 x=45+25*math.cos(a);y=45+25*math.sin(a)
 s.append(line(45,45,x,y,BURG,.8,.8))
s.append(diamond(17,17,6,BURG,1.1,ORANGE));s.append(diamond(13,112,4,ORANGE,.9));s.append(diamond(112,13,4,ORANGE,.9))
for y in [62,73,84]:s.append(circle(9,y,1.5,BURG,.5,BURG))
tag('cantoneira-cartaz',header(120,120,'Cantoneira Art Déco para cartaz musical',''.join(s)))

# 9. Culinary-music flourish for a rare footer signature: utensils/leaf in symmetric scrolls.
s=[]
s.append(f'<path d="M165 175V42M158 42V17M165 42V11M172 42V17" stroke="{GOLD}" stroke-width="2.2" stroke-linecap="round"/>')
s.append(f'<path d="M165 119L148 136L165 153L182 136Z" stroke="{ORANGE}" stroke-width="2" fill="{BURG}" fill-opacity=".65"/>')
s.append(diamond(165,136,6,GOLD,1.3,ORANGE))
for side in [-1,1]:
 s.append(f'<path d="M165 151C{165+side*52} 164 {165+side*64} 102 {165+side*101} 115C{165+side*134} 131 {165+side*117} 171 {165+side*84} 148" stroke="{GOLD}" stroke-width="1.7"/>')
 s.append(f'<path d="M165 157C{165+side*34} 185 {165+side*106} 199 {165+side*139} 170" stroke="{GOLD}" stroke-width="1.1" opacity=".7"/>')
 for j in range(3):
  x=165+side*(36+j*32); y=138+j*13
  s.append(f'<path d="M{x} {y}Q{x+side*23} {y-26} {x+side*25} {y-36}Q{x+side*2} {y-31} {x} {y}Z" stroke="{GOLD}" stroke-width="1" fill="{ORANGE}" fill-opacity=".12"/>')
 s.append(diamond(165+side*145,172,4,ORANGE,.8))
s.append(diamond(165,195,6,GOLD,1.4));s.append(circle(165,182,2,ORANGE,.3,ORANGE))
tag('flor-musica-culinaria',header(330,215,'Floral gastronômico e musical — assinatura do Salomé',''.join(s)))
print('CREATED',*[p.name for p in D.glob('*.svg')],sep='\n')
