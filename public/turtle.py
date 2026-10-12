"""Учебный Canvas-адаптер Turtle. Поддерживаемое API перечислено в README."""
import math, json
from js import turtleCommand

def _emit(**command): turtleCommand(json.dumps(command))

class Turtle:
    def __init__(self, *args, **kwargs):
        self.x=0.; self.y=0.; self.angle=0.; self.down=True; self.stroke='black'; self.fill='black'; self.pen_width=1; self.points=None
    def forward(self, distance):
        r=math.radians(self.angle); self.goto(self.x+float(distance)*math.cos(r),self.y+float(distance)*math.sin(r))
    fd=forward
    def backward(self, distance): self.forward(-distance)
    bk=back=backward
    def right(self, angle): self.angle=(self.angle-float(angle))%360
    rt=right
    def left(self, angle): self.angle=(self.angle+float(angle))%360
    lt=left
    def goto(self,x,y=None):
        if y is None:x,y=x
        x,y=float(x),float(y)
        if self.down:_emit(type='line',x1=self.x,y1=self.y,x2=x,y2=y,color=self.stroke,width=self.pen_width)
        self.x,self.y=x,y
        if self.points is not None:self.points.append([x,y])
    setpos=setposition=goto
    def setx(self,x):self.goto(x,self.y)
    def sety(self,y):self.goto(self.x,y)
    def setheading(self,angle):self.angle=float(angle)
    seth=setheading
    def heading(self):return self.angle
    def position(self):return (self.x,self.y)
    pos=position
    def xcor(self):return self.x
    def ycor(self):return self.y
    def home(self):self.goto(0,0);self.setheading(0)
    def penup(self):self.down=False
    pu=up=penup
    def pendown(self):self.down=True
    pd=down=pendown
    def isdown(self):return self.down
    def pencolor(self,*args):
        if args:self.stroke=_color(args)
        return self.stroke
    def fillcolor(self,*args):
        if args:self.fill=_color(args)
        return self.fill
    def color(self,*args):
        if args:self.stroke=self.fill=_color(args)
        return self.stroke,self.fill
    def pensize(self,width=None):
        if width is not None:self.pen_width=float(width)
        return self.pen_width
    width=pensize
    def dot(self,size=5,*color):_emit(type='dot',x=self.x,y=self.y,size=size,color=_color(color) if color else self.stroke)
    def begin_fill(self):self.points=[[self.x,self.y]]
    def end_fill(self):
        if self.points:_emit(type='polygon',points=self.points,color=self.fill)
        self.points=None
    def circle(self,radius,extent=360,steps=None):
        steps=steps or max(1,int(abs(extent)/3)); step=extent/steps; length=2*radius*math.sin(math.radians(step/2));self.left(step/2)
        for _ in range(steps):self.forward(length);self.left(step)
        self.right(step/2)
    def write(self,arg,move=False,align='left',font=('Arial',12,'normal')):_emit(type='text',x=self.x,y=self.y,text=str(arg),color=self.stroke,size=font[1])
    def clear(self):_emit(type='clear')
    def reset(self):self.clear();self.__init__()
    def speed(self,*args):return 0
    def hideturtle(self):pass
    ht=hideturtle
    def showturtle(self):pass
    st=showturtle
    def shape(self,*args):pass

def _color(args):
    if len(args)==1:
        if isinstance(args[0],str):return args[0]
        args=args[0]
    if len(args)==3:return 'rgb('+','.join(str(round(v*255 if _mode==1 else v)) for v in args)+')'
    raise ValueError('Цвет: имя или RGB')
_mode=1
_default=Turtle()
for _name in dir(Turtle):
    if not _name.startswith('_'):globals()[_name]=getattr(_default,_name)
class _Screen:
    def bgcolor(self,color):_emit(type='background',color=color)
    def title(self,*args):pass
    def setup(self,*args,**kwargs):pass
    def tracer(self,*args):pass
    def update(self):pass
    def exitonclick(self):pass
    def mainloop(self):pass
    def setworldcoordinates(self,llx,lly,urx,ury):_emit(type='world',bounds=[llx,lly,urx,ury])
_screen=_Screen()
def Screen():return _screen
for _name in dir(_Screen):
    if not _name.startswith('_'):globals()[_name]=getattr(_screen,_name)
def done():pass
def colormode(mode=None):
    global _mode
    if mode is not None:_mode=mode
    return _mode
