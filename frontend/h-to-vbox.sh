cat framework/source/class/qx/ui2/layout/HBox.js | \
  sed s:width:_xx1_:g | \
  sed s:height:_xx2_:g | \
  sed s:left:_xx3_:g | \
  sed s:top:_xx4_:g | \
  sed s:right:_xx5_:g | \
  sed s:bottom:_xx6_:g | \
  sed s:center:_xx7_:g | \
  sed s:middle:_xx8_:g | \
  sed s:vertical:_xx9_:g | \
  sed s:horizontal:_xx10_:g | \
\
  sed s:Width:_yy1_:g | \
  sed s:Height:_yy2_:g | \
  sed s:Left:_yy3_:g | \
  sed s:Top:_yy4_:g | \
  sed s:Right:_yy5_:g | \
  sed s:Bottom:_yy6_:g | \
  sed s:Center:_yy7_:g | \
  sed s:Middle:_yy8_:g | \
  sed s:Vertical:_yy9_:g | \
  sed s:Horizontal:_yy10_:g | \
\
  sed s:_xx1_:height:g | \
  sed s:_xx2_:width:g | \
  sed s:_xx3_:top:g | \
  sed s:_xx4_:left:g | \
  sed s:_xx5_:bottom:g | \
  sed s:_xx6_:right:g | \
  sed s:_xx7_:middle:g | \
  sed s:_xx8_:center:g | \
  sed s:_xx9_:horizontal:g | \
  sed s:_xx10_:vertical:g | \
\
  sed s:_yy1_:Height:g | \
  sed s:_yy2_:Width:g | \
  sed s:_yy3_:Top:g | \
  sed s:_yy4_:Left:g | \
  sed s:_yy5_:Bottom:g | \
  sed s:_yy6_:Right:g | \
  sed s:_yy7_:Middle:g | \
  sed s:_yy8_:Center:g | \
  sed s:_yy9_:Horizontal:g | \
  sed s:_yy10_:Vertical:g | \
\
  sed s:"function(height, width)":"function(width, height)":g | \
  sed s:"layout(childTop, childLeft, childHeights\[i\], childWidths\[i\])":"layout(childLeft, childTop, childWidths[i], childHeights[i])":g | \
  sed s:"HBox":"VBox":g | \
  sed s:"vertical row":"vertical column":g \
> framework/source/class/qx/ui2/layout/VBox.js
