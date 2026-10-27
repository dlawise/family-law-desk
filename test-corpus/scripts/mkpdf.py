import re,json,random,subprocess,os,io
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from PIL import Image,ImageFilter,ImageEnhance
import numpy as np, img2pdf
random.seed(7)
corpus=json.load(open('t/corpus/corpus.json'))
pick=['ws_b_thirdperson_solicitor.txt','ws_a_unnumbered_heads.txt','ws_e_bullets_instruction_form.txt','ord_a_fl404a_undertaking.txt','ord_b_fl404_occupation.txt','ord_c_c43_live_with.txt','note_a_table.txt','note_b_email_style.txt']
out='pdfs/'
def wrap(c,text,width,font,size):
    lines=[]
    for para in text.split('\n'):
        words=para.split(' ');cur=''
        for w in words:
            t=(cur+' '+w).strip()
            if c.stringWidth(t,font,size)<width:cur=t
            else:lines.append(cur);cur=w
        lines.append(cur)
    return lines
def make_text_pdf(name,text,header,footer,style):
    global CN
    m=re.search(r'\b[A-Z]{2}\d{2}[A-Z]\d{5}\b',text);CN=m.group(0) if m else ''
    path=out+name+'.pdf';c=canvas.Canvas(path,pagesize=A4);W,H=A4
    font={'a':'Times-Roman','b':'Helvetica','c':'Courier'}[style];size={'a':12,'b':10.5,'c':10}[style]
    lines=wrap(c,text,W-50*mm,font,size);per=int((H-60*mm)/(size*1.5));pages=[lines[i:i+per] for i in range(0,len(lines),per)] or [[]]
    # force multi-page by small page capacity
    cap=28;pages=[lines[i:i+cap] for i in range(0,len(lines),cap)] or [[]]
    for i,pl in enumerate(pages):
        c.setFont('Helvetica-Bold',9);c.drawString(25*mm,H-15*mm,header);c.drawRightString(W-25*mm,H-15*mm,('Case No: '+CN) if CN else '')
        c.line(25*mm,H-17*mm,W-25*mm,H-17*mm)
        c.setFont(font,size);y=H-35*mm
        for ln in pl:
            c.drawString(25*mm,y,ln);y-=size*1.5
        c.setFont('Helvetica',8);c.drawString(25*mm,12*mm,footer);c.drawRightString(W-25*mm,12*mm,'Page %d of %d'%(i+1,len(pages)))
        c.showPage()
    c.save();return path,len(pages)
def degrade(png,angle,blur,noise,jpeg):
    im=Image.open(png).convert('L').rotate(angle,expand=True,fillcolor=255,resample=Image.BICUBIC)
    if blur:im=im.filter(ImageFilter.GaussianBlur(blur))
    a=np.array(im).astype(np.float32)
    # uneven lighting + noise
    h,w=a.shape;grad=np.linspace(0.82,1.0,w)[None,:]*np.ones((h,1));a=a*grad+np.random.normal(0,noise,a.shape)
    im=Image.fromarray(np.clip(a,0,255).astype(np.uint8));
    buf=io.BytesIO();im.save(buf,'JPEG',quality=jpeg);return buf.getvalue(),im
res=[]
for d in corpus:
    if d['name'] not in pick:continue
    base=d['name'].replace('.txt','')
    style={'ws_b':'a','ws_a':'b','ws_e':'c'}.get(base[:4],'a')
    p,n=make_text_pdf(base+'_text',d['text'],'IN THE FAMILY COURT - CONFIDENTIAL','Dillex test footer - do not copy',style)
    # scanned: rasterise at 170dpi, degrade, rebuild image-only pdf
    subprocess.run(['pdftoppm','-r','170','-png',p,out+'_tmp_'+base],check=True)
    pngs=sorted(f for f in os.listdir(out) if f.startswith('_tmp_'+base))
    jpgs=[]
    for i,f in enumerate(pngs):
        b,im=degrade(out+f,random.choice([-1.2,0.8,1.5]),0.6,6,55)
        jpgs.append(b)
        if i==0:open(out+base+'_photo.jpg','wb').write(b)
        os.remove(out+f)
    open(out+base+'_scan.pdf','wb').write(img2pdf.convert(jpgs))
    res.append((base,n))
print(res)
