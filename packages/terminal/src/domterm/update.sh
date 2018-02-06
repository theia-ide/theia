DOMTERM_CLONE_DIR=${DOMTERM_CLONE_DIR-`pwd`/domterm-git}
DOMVERSION_LOCAL_DIR="."

TMP_VERSION=$DOMVERSION_LOCAL_DIR/domterm-version.js
FILES_TO_COPY="domterm-core.css domterm-default.css domterm-standard.css  ResizeSensor.js wcwidth.js"

if test -d $DOMTERM_CLONE_DIR
then
    (cd $DOMTERM_CLONE_DIR && git pull)
else
    git clone https://github.com/PerBothner/DomTerm.git $DOMTERM_CLONE_DIR
fi

DOMTERM_VERSION=`sed -n -e '/AC_INIT/s|^.*\[\([0-9][^]]*\)\].*$|\1|p' <$DOMTERM_CLONE_DIR/configure.ac`
DOMTERM_YEAR=`sed -n -e '/DOMTERM_YEAR=/s|^.*[^0-9]\([1-9][0-9]*\)[^0-9]*$|\1|p' <$DOMTERM_CLONE_DIR/configure.ac`

sed -e "s/@DOMTERM_VERSION@/$DOMTERM_VERSION/" \
    -e "s/@DOMTERM_YEAR@/$DOMTERM_YEAR/" \
    -e '/@configure_input@/d' \
    <$DOMTERM_CLONE_DIR/hlib/domterm-version.js.in > $TMP_VERSION
cat $DOMTERM_CLONE_DIR/hlib/terminal.js $TMP_VERSION >$DOMVERSION_LOCAL_DIR/terminal.js

for file in $FILES_TO_COPY
do
    cp $DOMTERM_CLONE_DIR/hlib/$file $DOMVERSION_LOCAL_DIR/$file
done
