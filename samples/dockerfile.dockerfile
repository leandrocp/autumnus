FROM <base-image>
# define base image

ENV USERNAME='admin'\
    PWD='****'
# optionally define environmental variables

RUN apt-get update
# run linux commands inside container env, does not affect host env
# This executes during the time of image creation

COPY <src> <target>
# executes on the host, copies files from src (usually on the host) to target
# on the container

ENTRYPOINT ["some-script.sh"]
# executes an entire script as an entrypoint

CMD [<args>,...]
# always part of dockerfile, introduces entry point linux command e.g.
# `CMD node server.js`
# This executes after image creation only when the container from the image
# is running.
