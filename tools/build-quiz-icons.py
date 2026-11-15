import json
from pathlib import Path
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
def write(kind,groups):
 data={'v':'5.13.0','fr':30,'ip':0,'op':180,'w':100,'h':100,'nm':'AK Explained — '+kind,'ddd':0,'assets':[],'layers':[layer(kind,groups,1)],'markers':[]}
 (out/f'quiz-{kind}.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
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
