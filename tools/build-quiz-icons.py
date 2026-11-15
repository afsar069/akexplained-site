import json
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring
# Original vector artwork for the homepage cards; no third-party animation assets.
out=Path(__file__).resolve().parents[1]/'assets'/'animations'
out.mkdir(parents=True,exist_ok=True)
def prop(v): return {'a':0,'k':v}
def motion(values,linear=False):
 return {'a':1,'k':[dict(t=t,s=v if isinstance(v,list) else [v],i={'x':[.65],'y':[.65 if linear else 1]},o={'x':[.35],'y':[.35 if linear else 0]}) for t,v in values]}
def full_turn():
 # Four seconds for one complete revolution, then two seconds of rest.
 return motion([(0,0),(120,360),(180,360)],linear=True)
def tick_reveal(start):
 return motion([(0,0),(start,0),(start+16,100),(180,100)])
def color(h):return [int(h[i:i+2],16)/255 for i in (1,3,5)]+[1]
def transform(p=(0,0),s=(100,100),r=0,o=100):
 return {'ty':'tr','p':p if isinstance(p,dict) else prop(list(p)),'a':prop([0,0]),'s':s if isinstance(s,dict) else prop(list(s)),'r':r if isinstance(r,dict) else prop(r),'o':o if isinstance(o,dict) else prop(o),'sk':prop(0),'sa':prop(0)}
def group(name,shapes,stroke,fill=None,trim=None,**kw):
 items=shapes[:]
 if fill:items.append({'ty':'fl','c':prop(color(fill)),'o':prop(100),'r':1})
 if stroke:items.append({'ty':'st','c':prop(color(stroke)),'o':prop(100),'w':prop(3),'lc':2,'lj':2})
 if trim:items.append({'ty':'tm','s':prop(0),'e':trim,'o':prop(0),'m':1})
 items.append(transform(**kw))
 return {'ty':'gr','nm':name,'it':items}
def ellipse(x,y,w,h):return {'ty':'el','p':prop([x,y]),'s':prop([w,h])}
def rect(x,y,w,h,r=4):return {'ty':'rc','p':prop([x,y]),'s':prop([w,h]),'r':prop(r)}
def path(points,closed=False):
 return {'ty':'sh','ks':prop({'i':[[0,0] for _ in points],'o':[[0,0] for _ in points],'v':points,'c':closed})}
def layer(name,shapes,index):
 return {'ddd':0,'ind':index,'ty':4,'nm':name,'sr':1,'ks':{'o':prop(100),'r':prop(0),'p':prop([0,0,0]),'a':prop([0,0,0]),'s':prop([100,100,100])},'ao':0,'shapes':list(reversed(shapes)),'ip':0,'op':180,'st':0,'bm':0}
def static_value(value):
 if not value['a']:return value['k']
 result=value['k'][-1]['s']
 return result[0] if len(result)==1 else result
def write_static(kind,groups):
 # Matching new artwork for reduced motion, no JavaScript, or failed downloads.
 svg=Element('svg',{'xmlns':'http://www.w3.org/2000/svg','viewBox':'0 0 100 100'})
 for g in groups:
  shapes=g['it'];tr=shapes[-1];p=static_value(tr['p']);s=static_value(tr['s'])
  fill=next((x for x in shapes if x['ty']=='fl'),None)
  stroke=next((x for x in shapes if x['ty']=='st'),None)
  def rgb(style):return '#'+''.join(f'{round(c*255):02x}' for c in style['c']['k'][:3])
  attrs={'transform':f"translate({p[0]} {p[1]}) rotate({static_value(tr['r'])}) scale({s[0]/100} {s[1]/100})",'opacity':str(static_value(tr['o'])/100),'fill':rgb(fill) if fill else 'none','stroke':rgb(stroke) if stroke else 'none','stroke-width':'3','stroke-linecap':'round','stroke-linejoin':'round'}
  node=SubElement(svg,'g',attrs)
  for shape in shapes:
   if shape['ty']=='el':
    x,y=shape['p']['k'];w,h=shape['s']['k'];SubElement(node,'ellipse',{'cx':str(x),'cy':str(y),'rx':str(w/2),'ry':str(h/2)})
   elif shape['ty']=='rc':
    x,y=shape['p']['k'];w,h=shape['s']['k'];SubElement(node,'rect',{'x':str(x-w/2),'y':str(y-h/2),'width':str(w),'height':str(h),'rx':str(shape['r']['k'])})
   elif shape['ty']=='sh':
    path_data=shape['ks']['k'];points=path_data['v']
    d='M'+' L'.join(f'{x},{y}' for x,y in points)+(' Z' if path_data['c'] else '')
    SubElement(node,'path',{'d':d})
 (out/f'exam-{kind}.svg').write_text(tostring(svg,encoding='unicode')+'\n')
def write(kind,groups,prefix='quiz'):
 data={'v':'5.13.0','fr':30,'ip':0,'op':180,'w':100,'h':100,'nm':'AK Explained — '+kind,'ddd':0,'assets':[],'layers':[layer(kind,groups,1)],'markers':[]}
 (out/f'{prefix}-{kind}.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
 if prefix=='exam':write_static(kind,groups)
gold='#936619';teal='#0F766E';sage='#557353';blue='#375C78';paper='#FFFDF7'
write('daily',[
 group('Target',[ellipse(45,54,57,57),ellipse(45,54,35,35)],gold),
 group('Bullseye',[ellipse(45,54,10,10)],None,gold),
 group('Arrow',[path([[0,0],[30,-30]]),path([[18,-30],[30,-30],[30,-18]])],gold,p=[45,54],r=full_turn()),
 group('Small spark',[path([[73,63],[73,73]]),path([[68,68],[78,68]])],gold,o=motion([(0,20),(20,100),(45,20),(180,20)]))
])
write('mcq',[
 group('Paper',[rect(49,51,51,66,7)],teal,paper),
 group('Paper clip',[rect(49,20,23,9,3)],teal,'#E4F0ED'),
 group('Answer lines',[path([[45,39],[64,39]]),path([[45,54],[64,54]]),path([[45,69],[59,69]])],teal),
 group('Empty answers',[rect(35,39,11,11,2),rect(35,54,11,11,2),rect(35,69,11,11,2)],teal,o=25),
 group('First answer',[path([[31,38],[34,41],[39,34]])],teal,trim=tick_reveal(8)),
 group('Second answer',[path([[31,53],[34,56],[39,49]])],teal,trim=tick_reveal(34)),
 group('Third answer',[path([[31,68],[34,71],[39,64]])],teal,trim=tick_reveal(60)),
 group('Practice clock',[ellipse(77,71,19,19)],teal,'#E4F0ED'),
 group('Clock hour',[path([[77,71],[80,73]])],teal),
 group('Clock minute',[path([[0,0],[0,-5]])],teal,p=[77,71],r=full_turn())
])
write('pyq',[
 group('Back paper',[rect(43,44,43,56,5)],sage,'#EAF0E3',r=-7,p=[2,4]),
 group('Past paper',[rect(45,47,43,56,5)],sage,paper),
 group('Paper lines',[path([[43,33],[57,33]]),path([[43,44],[55,44]]),path([[43,55],[51,55]])],sage),
 group('First past answer',[path([[29,32],[32,35],[37,28]])],sage,trim=tick_reveal(8)),
 group('Second past answer',[path([[29,43],[32,46],[37,39]])],sage,trim=tick_reveal(34)),
 group('Third past answer',[path([[29,54],[32,57],[37,50]])],sage,trim=tick_reveal(60)),
 group('History clock',[ellipse(68,67,32,32)],sage,'#EAF0E3'),
 group('Clock hour',[path([[68,67],[74,70]])],sage),
 group('Clock minute',[path([[0,0],[0,-9]])],sage,p=[68,67],r=full_turn()),
 group('Page highlight',[path([[32,65],[44,65]])],sage,o=motion([(0,40),(25,100),(55,40),(180,40)]))
])
write('mock',[
 group('Timer body',[ellipse(48,54,54,54)],blue,paper),
 group('Timer top',[rect(48,19,14,7,2),path([[48,23],[48,27]]),path([[69,31],[74,26]])],blue,'#E9F0F4'),
 group('Timer markers',[path([[48,33],[48,37]]),path([[27,54],[31,54]]),path([[48,71],[48,75]]),path([[65,54],[69,54]])],blue),
 group('Timer hand',[path([[0,0],[0,-13]])],blue,p=[48,54],r=full_turn()),
 group('Timer center',[ellipse(48,54,5,5)],None,blue),
 group('Test check badge',[ellipse(73,74,23,23)],blue,'#E9F0F4'),
 group('Test check',[path([[67,74],[71,78],[79,69]])],blue,trim=tick_reveal(120))
])

# Pick Your Exam: five original illustrations with more visible, subject-specific motion.
bob=motion([(0,[0,0]),(30,[0,-4]),(60,[0,0]),(180,[0,0])])
write('net',[
 group('Graduation base',[path([[27,43],[27,59],[50,67],[73,59],[73,43]],True)],blue,'#E9F0F4',p=bob),
 group('Graduation cap',[path([[15,35],[50,18],[85,35],[50,52]],True)],blue,paper,p=bob),
 group('Cap seam',[path([[50,35],[83,35]])],blue,p=bob),
 group('Tassel',[path([[0,0],[0,27]]),path([[0,27],[-3,33],[3,33]],True)],blue,'#E9F0F4',p=motion([(0,[83,35]),(30,[83,31]),(60,[83,35]),(180,[83,35])]),r=motion([(0,0),(20,12),(42,-12),(65,8),(90,0),(180,0)])),
 group('Diploma',[rect(47,78,39,12,4)],blue,paper),
 group('Diploma ribbon',[path([[48,72],[48,84],[52,88],[56,84],[56,72]])],gold),
 group('Academic sparkle',[path([[19,57],[19,67]]),path([[14,62],[24,62]])],gold,o=motion([(0,30),(25,100),(60,30),(180,30)]))
],prefix='exam')

rust='#9B562B'
write('pgt',[
 group('Left book',[path([[50,30],[35,24],[15,27],[15,74],[34,71],[50,78]],True)],rust,'#F8EADB'),
 group('Right book',[path([[50,30],[65,24],[85,27],[85,74],[66,71],[50,78]],True)],rust,'#F8EADB'),
 group('Left text',[path([[23,40],[39,39]]),path([[23,50],[39,49]]),path([[23,60],[36,59]])],rust),
 group('Turning page',[path([[0,0],[17,-3],[30,0],[30,45],[14,42],[0,48]],True),path([[7,12],[23,12]]),path([[7,22],[23,22]]),path([[7,32],[20,32]])],rust,paper,p=[50,29],s=motion([(0,[100,100]),(12,[100,100]),(36,[0,100]),(60,[-100,100]),(90,[-100,100]),(114,[0,100]),(138,[100,100]),(180,[100,100])])),
 group('Book spine',[path([[50,30],[50,78]])],rust),
 group('Reading spark',[path([[78,12],[78,20]]),path([[74,16],[82,16]])],gold,o=motion([(0,25),(45,100),(90,25),(180,25)]))
],prefix='exam')

write('psc',[
 group('Institution roof',[path([[15,32],[50,15],[85,32]],True),path([[17,38],[83,38]])],sage,'#EAF0E3'),
 group('Roof seal',[ellipse(50,27,6,6)],None,sage),
 *[group(f'Column {i+1}',[rect(0,-16,9,33,2),rect(0,-34,17,4,1)],sage,paper,p=[x,75],s=motion([(0,[100,0]),(8+i*22,[100,0]),(28+i*22,[100,100]),(180,[100,100])])) for i,x in enumerate([28,50,72])],
 group('Institution steps',[rect(50,79,65,5,1),rect(50,86,76,5,1)],sage,'#EAF0E3')
],prefix='exam')

write('university',[
 group('Study book left',[path([[50,31],[34,26],[15,29],[15,76],[34,73],[50,79]],True)],teal,paper),
 group('Study book right',[path([[50,31],[66,26],[85,29],[85,76],[66,73],[50,79]],True)],teal,'#E4F0ED'),
 group('Study spine',[path([[50,31],[50,79]])],teal),
 group('First written line',[path([[23,42],[40,41]])],teal,trim=tick_reveal(8)),
 group('Second written line',[path([[23,53],[40,52]])],teal,trim=tick_reveal(34)),
 group('Third written line',[path([[23,64],[36,63]])],teal,trim=tick_reveal(60)),
 group('Writing pencil',[path([[0,-22],[5,-22],[5,14],[2.5,21],[0,14]],True),path([[0,14],[5,14]])],teal,paper,p=motion([(0,[74,45]),(20,[63,51]),(40,[73,58]),(60,[63,65]),(85,[74,45]),(180,[74,45])]),r=25)
],prefix='exam')

write('others',[
 group('Compass outer ring',[ellipse(50,50,74,74)],gold,o=30),
 group('Compass face',[ellipse(50,50,58,58)],gold,paper),
 group('Compass points',[path([[50,23],[50,29]]),path([[50,71],[50,77]]),path([[23,50],[29,50]]),path([[71,50],[77,50]])],gold),
 group('Compass needle',[path([[0,-21],[6,0],[0,21],[-6,0]],True)],gold,'#F7EED8',p=[50,50],r=full_turn()),
 group('Compass center',[ellipse(50,50,5,5)],None,gold)
],prefix='exam')
