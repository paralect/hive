#!/bin/sh
DIR=$PROJECT_SRC
echo CHECKING $DIR

if [ -f "$DIR/package.json" ]; then
  echo "Project already initialized"
else
  ###  Control will jump here if $DIR does NOT exists ###
  echo "Configuring project..."
  cd "$( dirname "${BASH_SOURCE[0]}" )"
  cd ..
  pwd
  mkdir -p $PROJECT_SRC

  echo Unzipping project starter to $DIR
  unzip ./project-api-starter.zip -d $DIR

  echo dir before script
  ls $PROJECT_SRC
fi

exit 1