FROM python:2.7
ENV PYTHONUNBUFFERED 1
RUN mkdir /src
WORKDIR /src
ADD ./requeriments.txt /src/
RUN pip install -r ./requeriments.txt
ADD . /src/
